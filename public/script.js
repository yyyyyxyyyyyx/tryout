document.addEventListener("DOMContentLoaded", () => {
  const addProductBtn = document.getElementById("addProductBtn");
  const submitProductBtn = document.getElementById("submitProductBtn");
  const productForm = document.getElementById("productForm");
  const productTableBody = document.getElementById("productTableBody");

  let productCount = 0;

  // 显示/隐藏输入表单
  addProductBtn.addEventListener("click", () => {
    productForm.style.display = productForm.style.display === "none" ? "block" : "none";
  });

  // 提交新产品
  submitProductBtn.addEventListener("click", () => {
    const productName = document.getElementById("productName").value.trim();
    const productDescription = document.getElementById("productDescription").value.trim();

    if (productName && productDescription) {
      productCount++;

      // 添加新行到表格
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${productCount}</td>
        <td>${productName}</td>
        <td>${productDescription}</td>
      `;
      productTableBody.appendChild(newRow);

      // 清空输入框
      document.getElementById("productName").value = "";
      document.getElementById("productDescription").value = "";
      productForm.style.display = "none"; // 隐藏表单
    } else {
      alert("Please fill in all fields!");
    }
  });
});
