const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("search");
const specializationFilter = document.getElementById("specializationFilter");
const countryFilter = document.getElementById("countryFilter");
const emptyMessage = document.getElementById("emptyMessage");
const resultCount = document.getElementById("resultCount");

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

        createFilters();
        displayResults(partnerships);
    })
    .catch(error => {
        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">حدث خطأ أثناء تحميل البيانات.</td>
            </tr>
        `;
    });

function createFilters() {
    const specializations = [
        ...new Set(partnerships.map(item => item.specialization))
    ].sort();

    const countries = [
        ...new Set(partnerships.map(item => item.country))
    ].sort();

    specializations.forEach(specialization => {
        const option = document.createElement("option");
        option.value = specialization;
        option.textContent = specialization;
        specializationFilter.appendChild(option);
    });

    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

function displayResults(data) {
    tableBody.innerHTML = "";

    resultCount.textContent = `عدد النتائج: ${data.length}`;

    if (data.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    data.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.specialization}</td>
            <td>${item.partnership}</td>
            <td>${item.country}</td>
            <td>${item.program}</td>
            <td>${item.price}</td>
            <td>${item.scholarshipSupport}</td>
            <td>${item.languageRequirements}</td>
            <td>${item.gpaRequirement}</td>
        `;

        tableBody.appendChild(row);
    });
}

function filterResults() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const selectedSpecialization = specializationFilter.value;
    const selectedCountry = countryFilter.value;

    const filteredData = partnerships.filter(item => {
        const matchesSpecialization =
            selectedSpecialization === "" ||
            item.specialization === selectedSpecialization;

        const matchesCountry =
            selectedCountry === "" ||
            item.country === selectedCountry;

        const searchableText = `
            ${item.specialization}
            ${item.partnership}
            ${item.country}
            ${item.program}
        `.toLowerCase();

        const matchesSearch =
            searchableText.includes(searchValue);

        return matchesSpecialization && matchesCountry && matchesSearch;
    });

    displayResults(filteredData);
}

searchInput.addEventListener("input", filterResults);
specializationFilter.addEventListener("change", filterResults);
countryFilter.addEventListener("change", filterResults);
