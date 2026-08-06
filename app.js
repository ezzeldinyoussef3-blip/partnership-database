const searchInput = document.getElementById("searchInput");
const specializationFilter = document.getElementById(
    "specializationFilter"
);
const countryFilter = document.getElementById("countryFilter");
const partnershipFilter = document.getElementById(
    "partnershipFilter"
);
const scholarshipFilter = document.getElementById(
    "scholarshipFilter"
);

const resetButton = document.getElementById("resetButton");
const cardsContainer = document.getElementById("cardsContainer");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const errorState = document.getElementById("errorState");

let programs = [];

fetch("partnerships.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Failed to load data");
        }

        return response.json();
    })
    .then((data) => {
        programs = data;

        createFilterOptions();
        filterPrograms();
    })
    .catch((error) => {
        console.error(error);

        cardsContainer.innerHTML = "";
        emptyState.style.display = "none";
        errorState.style.display = "block";
        resultCount.textContent = "0";
    });

function createFilterOptions() {
    addOptions(
        specializationFilter,
        getUniqueValues("specialization")
    );

    addOptions(
        countryFilter,
        getUniqueValues("country")
    );

    addOptions(
        partnershipFilter,
        getUniqueValues("partnership")
    );
}

function getUniqueValues(propertyName) {
    return [
        ...new Set(
            programs
                .map((item) => item[propertyName])
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b));
}

function addOptions(selectElement, values) {
    values.forEach((value) => {
        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        selectElement.appendChild(option);
    });
}

function filterPrograms() {
    const searchValue = normalizeText(searchInput.value);
    const selectedSpecialization = specializationFilter.value;
    const selectedCountry = countryFilter.value;
    const selectedPartnership = partnershipFilter.value;
    const selectedScholarship = scholarshipFilter.value;

    const filteredPrograms = programs.filter((item) => {
        const searchableContent = normalizeText(`
            ${item.specialization || ""}
            ${item.partnership || ""}
            ${item.country || ""}
            ${item.university || ""}
            ${item.program || ""}
        `);

        const matchesSearch =
            searchValue === "" ||
            searchableContent.includes(searchValue);

        const matchesSpecialization =
            selectedSpecialization === "" ||
            item.specialization === selectedSpecialization;

        const matchesCountry =
            selectedCountry === "" ||
            item.country === selectedCountry;

        const matchesPartnership =
            selectedPartnership === "" ||
            item.partnership === selectedPartnership;

        const matchesScholarship =
            selectedScholarship === "" ||
            item.scholarshipSupport === selectedScholarship;

        return (
            matchesSearch &&
            matchesSpecialization &&
            matchesCountry &&
            matchesPartnership &&
            matchesScholarship
        );
    });

    displayPrograms(filteredPrograms);
}

function displayPrograms(data) {
    cardsContainer.innerHTML = "";
    resultCount.textContent = data.length;

    if (data.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    errorState.style.display = "none";

    data.forEach((item) => {
        const card = document.createElement("article");

        card.className = "result-card";

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h2>${escapeHTML(item.specialization)}</h2>
                    <p>${escapeHTML(item.partnership)}</p>
                </div>

                <span class="country-badge">
                    ${escapeHTML(item.country)}
                </span>
            </div>

            <div class="card-body">
                <div class="data-grid">

                    <div class="data-item">
                        <span>الجامعة</span>
                        <strong>
                            ${escapeHTML(item.university)}
                        </strong>
                    </div>

                    <div class="data-item">
                        <span>البرنامج</span>
                        <strong>
                            ${escapeHTML(item.program)}
                        </strong>
                    </div>

                    <div class="data-item">
                        <span>الرسوم الدراسية</span>
                        <strong>
                            ${escapeHTML(item.price)}
                        </strong>
                    </div>

                    <div class="data-item">
                        <span>دعم الابتعاث</span>

                        <strong class="scholarship-badge
                            ${getScholarshipClass(
                                item.scholarshipSupport
                            )}">
                            ${getScholarshipLabel(
                                item.scholarshipSupport
                            )}
                        </strong>
                    </div>

                    <div class="data-item">
                        <span>متطلبات اللغة</span>
                        <strong>
                            ${escapeHTML(
                                item.languageRequirements
                            )}
                        </strong>
                    </div>

                    <div class="data-item">
                        <span>المعدل المطلوب</span>
                        <strong>
                            ${escapeHTML(item.gpaRequirement)}
                        </strong>
                    </div>

                    <div class="data-item">
                        <span>موعد الدراسة</span>
                        <strong>
                            ${escapeHTML(item.intake)}
                        </strong>
                    </div>

                    <div class="data-item full-width">
                        <span>ملاحظات</span>
                        <strong>
                            ${escapeHTML(item.notes)}
                        </strong>
                    </div>

                </div>
            </div>
        `;

        cardsContainer.appendChild(card);
    });
}

function getScholarshipClass(status) {
    if (status === "Supported") {
        return "supported";
    }

    if (status === "Not Supported") {
        return "not-supported";
    }

    return "to-be-confirmed";
}

function getScholarshipLabel(status) {
    if (status === "Supported") {
        return "مدعوم";
    }

    if (status === "Not Supported") {
        return "غير مدعوم";
    }

    return "غير مؤكد";
}

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .trim();
}

function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value || "سيتم إضافته";
    return div.innerHTML;
}

function resetFilters() {
    searchInput.value = "";
    specializationFilter.value = "";
    countryFilter.value = "";
    partnershipFilter.value = "";
    scholarshipFilter.value = "";

    filterPrograms();
    searchInput.focus();
}

searchInput.addEventListener("input", filterPrograms);
specializationFilter.addEventListener("change", filterPrograms);
countryFilter.addEventListener("change", filterPrograms);
partnershipFilter.addEventListener("change", filterPrograms);
scholarshipFilter.addEventListener("change", filterPrograms);
resetButton.addEventListener("click", resetFilters);
