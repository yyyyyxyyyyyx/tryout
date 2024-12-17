import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gfiaqcurffdlwaoacbax.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmaWFxY3VyZmZkbHdhb2FjYmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxODUyNTMsImV4cCI6MjA0OTc2MTI1M30.1iov3e1de6nwNPMNMnLMPsnKRZrAcNFGZZLl0TigB18";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchProducts() {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = ''; // 清空现有内容

  data.forEach((product) => {
    const logoImage = product.logo_url && product.logo_url.startsWith('http') ? 
      `<img src="${product.logo_url}" alt="${product.name} logo" style="width: 50px; height: 50px; object-fit: contain;">` : 
      '无 Logo'; // 处理 logo_url 为 null 或无效的情况

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${logoImage}</td> <!-- 添加 Logo -->
      <td>${product.name}</td>
      <td>${product.description}</td>
    `;
    tableBody.appendChild(newRow);
  });
}

document.addEventListener("DOMContentLoaded", fetchProducts);

export { fetchProducts };
