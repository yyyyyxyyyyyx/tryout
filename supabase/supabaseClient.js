import { createClient } from "@supabase/supabase-js";

// 替换为您的 Supabase 项目 URL 和匿名密钥
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchProducts() {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  const productTableBody = document.getElementById("productTableBody");

  data.forEach((product, index) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${index + 1}</td>
      <td>${product.name}</td>
      <td>${product.description}</td>
    `;
    productTableBody.appendChild(newRow);
  });
}

document.addEventListener("DOMContentLoaded", fetchProducts);
