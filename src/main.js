import { supabase } from './supabase/supabaseClient';

// DOM elements
const tableBody = document.getElementById("table-body");
const submitButton = document.getElementById("submit-product");
const popupForm = document.getElementById("popup-form");
const overlay = document.getElementById("overlay");
const closeFormButton = document.getElementById("close-form");
const submitFormButton = document.getElementById("submit-form");

// 初始化变量
let productsData = []; // 存储产品数据
let currentPage = 1; // 当前页数
const itemsPerPage = 10; // 每页显示的项目数

// 清空表格内容的函数
function clearTable() {
    tableBody.innerHTML = '';
}

// 定义 handleLike 函数
async function handleLike(productId, action) {
    console.log(`Product ID: ${productId}, Action: ${action}`); // 添加日志
    try {
        const { data, error } = await supabase
            .from('products')
            .select('likes, dislikes') // 确保同时获取 likes 和 dislikes
            .eq('id', productId)
            .single();

        if (error) {
            console.error("查询错误:", error);
            return; // 处理错误
        }

        if (!data) {
            console.error("未找到数据");
            return; // 处理未找到数据的情况
        }

        const updateData = {};
        
        // 根据 action 更新 likes 或 dislikes
        if (action === 'like') {
            updateData.likes = (data.likes || 0) + 1; // 点赞时增加 likes
            updateData.dislikes = data.dislikes || 0; // 点赞时保持 dislikes 不变
        } else if (action === 'dislike') {
            updateData.dislikes = (data.dislikes || 0) + 1; // 点踩时增加 dislikes
            updateData.likes = data.likes || 0; // 点踩时保持 likes 不变
        }

        const { error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productId);

        if (updateError) throw updateError;

        // 重新获取最新数据
        const { data: updatedData, error: fetchError } = await supabase
            .from('products')
            .select('likes, dislikes')
            .eq('id', productId)
            .single();

        if (fetchError) {
            console.error("获取更新数据失败:", fetchError);
            return;
        }

        // 更新表格中的相应行
        const likeButton = document.querySelector(`button[onclick="handleLike(${productId}, 'like')"]`);
        const dislikeButton = document.querySelector(`button[onclick="handleLike(${productId}, 'dislike')"]`);
        
        // 更新按钮文本
        likeButton.innerText = `👍 ${updatedData.likes}`; // 使用最新的点赞数
        dislikeButton.innerText = `👎 ${updatedData.dislikes}`; // 使用最新的点踩数

    } catch (e) {
        console.error("操作失败:", e);
    }
}

// Fetch products from Supabase
async function fetchProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("获取数据失败:", error);
            return;
        }

        productsData = data; // 存储获取的数据
        currentPage = 1; // 重置当前页
        renderProducts(productsData); // 渲染产品
    } catch (e) {
        console.error("获取数据失败:", e);
    }
}

// 显示表单
function showForm() {
    popupForm.style.display = "block";
    overlay.style.display = "block";
}

// 隐藏表单
function hideForm() {
    popupForm.style.display = "none";
    overlay.style.display = "none";
    // 清空表单
    document.getElementById("product-name").value = "";
    document.getElementById("product-description").value = "";
}

// 提交新产品
async function submitNewProduct() {
    const name = document.getElementById("product-name").value;
    const description = document.getElementById("product-description").value;
    const requirement = document.getElementById("product-requirement").value;
    const logoFile = document.getElementById("product-logo").files[0];

    if (!name || !description || !requirement || !logoFile) {
        alert("请填写所有字段！");
        return;
    }

    try {
        // 首先上传图片
        const logoPath = `product-logos/${Date.now()}-${logoFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(logoPath, logoFile);

        if (uploadError) {
            throw uploadError;
        }

        // 构建完整的 logo URL
        const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from('logos')
        .getPublicUrl(logoPath);
        
        if (publicUrlError) {
            console.error("生成公共 URL 失败:", publicUrlError);
            throw publicUrlError;
        }
        
        const logoUrl = publicUrlData.publicUrl; // 这才是正确的公共 URL
        console.log("生成的 Logo URL:", logoUrl); // 打印生成的 URL

        // 然后插入产品数据
        const { error } = await supabase
            .from('products')
            .insert([{ 
                name, 
                description, 
                requirement,
                logo_url: logoUrl, // 使用完整的 URL
                likes: 0,
                dislikes: 0
            }]);

        if (error) {
            throw error;
        }

        console.log("插入的数据:", { 
            name, 
            description, 
            requirement,
            logo_url: logoUrl,
            likes: 0,
            dislikes: 0
        });

        hideForm();
        fetchProducts();
    } catch (e) {
        console.error("执行错误:", e);
        alert("添加产品失败！");
    }
}

// 渲染产品的函数
function renderProducts(data) {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = ''; // 清空现有表格内容

    // 计算当前页的数据
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    // 检查是否有数据
    if (paginatedData.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5" style="text-align: center;">没有数据可显示</td>`;
        tableBody.appendChild(row);
        return;
    }

    paginatedData.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${product.logo_url || '无 Logo'}" alt="${product.name} logo" style="width: 50px; height: 50px; object-fit: contain;"></td>
            <td>${product.name}</td>
            <td>${product.description}</td>
            <td>${product.requirement || 'null'}</td>
            <td>
                <button onclick="handleLike(${product.id}, 'like')" class="like-btn">👍 ${product.likes}</button>
                <button onclick="handleLike(${product.id}, 'dislike')" class="dislike-btn">👎 ${product.dislikes}</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // 更新分页按钮状态
    document.getElementById("prev-page").disabled = currentPage === 1;
    document.getElementById("next-page").disabled = endIndex >= data.length;
}

// 分页按钮事件监听器
document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderProducts(productsData);
    }
});

document.getElementById("next-page").addEventListener("click", () => {
    if ((currentPage * itemsPerPage) < productsData.length) {
        currentPage++;
        renderProducts(productsData);
    }
});

// Event listeners
window.onload = () => {
    fetchProducts();
    
    // 绑定事件监听器
    document.getElementById("sort-date").addEventListener("click", (event) => {
        event.preventDefault(); // 防止链接跳转
        sortByDate();
    });

    document.getElementById("sort-likes").addEventListener("click", (event) => {
        event.preventDefault(); // 防止链接跳转
        sortByLikes();
    });

    // 绑定添加新产品按钮的事件监听器
    document.getElementById("add-product").addEventListener("click", showForm);
    document.getElementById("close-form").addEventListener("click", hideForm);
    document.getElementById("overlay").addEventListener("click", hideForm);
    document.getElementById("submit-form").addEventListener("click", submitNewProduct);
};

// 排序函数
function sortByDate() {
    const sortedData = [...productsData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderProducts(sortedData);
}

function sortByLikes() {
    const sortedData = [...productsData].sort((a, b) => b.likes - a.likes);
    renderProducts(sortedData);
}

// 添加事件监听器
document.getElementById("sort-date").addEventListener("click", sortByDate);
document.getElementById("sort-likes").addEventListener("click", sortByLikes);

window.handleLike = handleLike; // 使函数在全局可用
