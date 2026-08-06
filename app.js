const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("search");

let partnerships = [];

fetch("partnerships.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("تعذر تحميل البيانات");
        }

        return response.json();
    })
    .then(data => {
        partnerships = data;
        displayPartnerships(partnerships);
    })
    .catch(error => {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">حدث خطأ أثناء تحميل البيانات.</td>
            </tr>
        `;

        console.error(error);
    });

function displayPartnerships(data) {
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">لا توجد نتائج.</td>
            </tr>
        `;
        return;
    }

    data.forEach(partner => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${partner.partner}</td>
            <td>${partner.country}</td>
            <td>${partner.programs}</td>
            <td>${partner.status}</td>
        `;

        tableBody.appendChild(row);
    });
}

searchInput.addEventListener("input", event => {
    const searchValue = event.target.value.toLowerCase().trim();

    const filteredPartnerships = partnerships.filter(partner => {
        return (
            partner.partner.toLowerCase().includes(searchValue) ||
            partner.country.toLowerCase().includes(searchValue) ||
            partner.programs.toLowerCase().includes(searchValue) ||
            partner.status.toLowerCase().includes(searchValue)
        );
    });

    displayPartnerships(filteredPartnerships);
});
