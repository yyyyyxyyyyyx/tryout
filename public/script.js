// Initialize Supabase client
const { createClient } = supabase;
const supabaseUrl = "https://gfiaqcurffdlwaoacbax.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmaWFxY3VyZmZkbHdhb2FjYmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxODUyNTMsImV4cCI6MjA0OTc2MTI1M30.1iov3e1de6nwNPMNMnLMPsnKRZrAcNFGZZLl0TigB18";
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM elements
const tableBody = document.getElementById("table-body");
const submitButton = document.getElementById("submit-product");
const popupForm = document.getElementById("popup-form");
const overlay = document.getElementById("overlay");
const closeFormButton = document.getElementById("close-form");
const submitFormButton = document.getElementById("submit-form");

// 清空表格内容的函数
function clearTable() {
    tableBody.innerHTML = '';
}

// Fetch products from Supabase
async function fetchProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (error) {
            console.error("Error fetching data:", error);
            return;
        }

        clearTable(); // 清空现有数据

        // Populate table with data
        data.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.description}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (e) {
        console.error("执行错误:", e);
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

    if (!name || !description) {
        alert("请填写所有字段！");
        return;
    }

    try {
        const { error } = await supabase
            .from('products')
            .insert([{ name, description }]);

        if (error) {
            console.error("Error inserting data:", error);
            alert("添加产品失败！");
            return;
        }

        hideForm();
        fetchProducts(); // 刷新表格数据
    } catch (e) {
        console.error("执行错误:", e);
        alert("添加产品失败！");
    }
}

// Event listeners
window.onload = fetchProducts;
submitButton.addEventListener("click", showForm);
closeFormButton.addEventListener("click", hideForm);
overlay.addEventListener("click", hideForm);
submitFormButton.addEventListener("click", submitNewProduct);
