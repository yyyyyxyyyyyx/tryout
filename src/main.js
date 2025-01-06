import { supabase } from './supabase/supabaseClient';

// DOM elements
const tableBody = document.getElementById("table-body");
const submitButton = document.getElementById("add-product");
const popupForm = document.getElementById("popup-form");
const overlay = document.getElementById("overlay");
const closeFormButton = document.getElementById("close-form");
const submitFormButton = document.getElementById("submit-form");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const floatingButton = document.getElementById("floating-button");
const addProductIcon = document.getElementById("add-product-icon");
const searchInput = document.getElementById("searchInput");
const cardsContainer = document.getElementById("cards-container");
const sortDateBtn = document.getElementById("sort-date");
const sortLikesBtn = document.getElementById("sort-likes");

// 初始化变量
let productsData = []; // 存储产品数据
let filteredProducts = []; // 存储过滤后的产品数据
let currentPage = 1; // 当前页数
const itemsPerPage = 8; // 每页显示8个卡片

// 清空卡片容器的函数
function clearContainer() {
    cardsContainer.innerHTML = '';
}

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
            .select('*') // 确保包含 created_at 字段
            .order('created_at', { ascending: false });

        if (error) {
            console.error("获取数据失败:", error);
            return;
        }

        productsData = data; // 存储获取的数据
        filteredProducts = [...productsData]; // 初始化过滤后的数据
        renderProducts(); // 渲染产品列表
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

// 渲染产品列表
function renderProducts() {
    clearContainer();
    
    // 计算当前页的数据
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    currentProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        
        card.innerHTML = `
            <div class="logo-wrapper">
                <img src="${product.logo_url}" alt="${product.name} logo">
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="beta-tester">Looking for: ${product.requirement}</p>
            <div class="card-footer">
                <div class="interaction-buttons">
                    <button onclick="handleLike(${product.id}, 'like')">
                        👍 ${product.likes || 0}
                    </button>
                    <button onclick="handleLike(${product.id}, 'dislike')">
                        👎 ${product.dislikes || 0}
                    </button>
                </div>
                <small>${new Date(product.created_at).toLocaleDateString()}</small>
            </div>
        `;
        
        cardsContainer.appendChild(card);
    });

    // 更新分页按钮状态
    updatePaginationButtons();
}

// 搜索功能
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    // 过滤产品数据
    filteredProducts = productsData.filter(product => 
        product.name?.toLowerCase().includes(searchTerm) || 
        product.description?.toLowerCase().includes(searchTerm)
    );
    
    // 重置到第一页并重新渲染
    currentPage = 1;
    renderProducts();
    
    // 更新分页按钮状态
    updatePaginationButtons();
}

// 更新分页按钮状态
function updatePaginationButtons() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages || totalPages === 0;
}

// Event listeners
window.onload = async () => {
    await fetchProducts();
    
    // 绑定事件监听器
    submitButton.addEventListener("click", showForm);
    closeFormButton.addEventListener("click", hideForm);
    overlay.addEventListener("click", hideForm);
    submitFormButton.addEventListener("click", submitNewProduct);
    window.handleLike = handleLike; // 使函数在全局可用

    // 分页按钮事件监听器
    prevPageButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    });

    nextPageButton.addEventListener("click", () => {
        if ((currentPage * itemsPerPage) < filteredProducts.length) {
            currentPage++;
            renderProducts();
        }
    });

    // 排序按钮事件监听器
    sortDateBtn.addEventListener("click", () => {
        filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        currentPage = 1; // 重置到第一页
        renderProducts();
    });

    sortLikesBtn.addEventListener("click", () => {
        filteredProducts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        currentPage = 1; // 重置到第一页
        renderProducts();
    });

    // 显示或隐藏图标按钮
    window.onscroll = function() {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            floatingButton.style.display = "block"; // 滚动超过100px时显示按钮
        } else {
            floatingButton.style.display = "none"; // 否则隐藏按钮
        }
    };

    // 点击图标按钮时显示弹出表单
    addProductIcon.addEventListener("click", showForm);

    // 添加搜索框事件监听
    searchInput.addEventListener('input', handleSearch);
};
