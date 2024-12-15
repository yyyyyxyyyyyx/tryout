// 初始化 Supabase 客户端（在浏览器环境中直接引入）
const supabaseUrl = "https://gfiaqcurffdlwaoacbax.supabase.co"; // 替换为您的 Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmaWFxY3VyZmZkbHdhb2FjYmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxODUyNTMsImV4cCI6MjA0OTc2MTI1M30.1iov3e1de6nwNPMNMnLMPsnKRZrAcNFGZZLl0TigB18"; // 替换为您的 Supabase Anon Key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 获取表格元素
const tableBody = document.getElementById("table-body");

// 从 Supabase 获取产品数据
async function fetchProducts() {
    const { data, error } = await supabase
        .from('products') // 连接到 'products' 表
        .select('*'); // 获取所有字段的数据

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    // 动态填充表格
    data.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.description}</td>
        `;
        tableBody.appendChild(row);
    });
}

// 页面加载时获取数据
window.onload = fetchProducts;

// 添加提交按钮的事件监听器（这里可以用来弹出一个表单来提交新产品）
document.getElementById("submit-product").addEventListener("click", () => {
    alert("This is where you can add a product submission form.");
    // 您可以在这里弹出一个表单来提交新产品，或者直接跳转到添加产品的页面
});
