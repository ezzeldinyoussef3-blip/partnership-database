const searchInput =
    document.getElementById("searchInput");

const specializationFilter =
    document.getElementById("specializationFilter");

const degreeLevelFilter =
    document.getElementById("degreeLevelFilter");

const countryFilter =
    document.getElementById("countryFilter");

const partnershipFilter =
    document.getElementById("partnershipFilter");

const universityFilter =
    document.getElementById("universityFilter");

const scholarshipFilter =
    document.getElementById("scholarshipFilter");

const resetButton =
    document.getElementById("resetButton");

const cardsContainer =
    document.getElementById("cardsContainer");

const resultCount =
    document.getElementById("resultCount");

const emptyState =
    document.getElementById("emptyState");

const errorState =
    document.getElementById("errorState");


let programs = [];


/* =========================================
   Load Data
========================================= */

fetch("./partnerships.json")

    .then((response) => {

        if (!response.ok) {

            throw new Error(
                `Failed to load data: ${response.status}`
            );

        }

        return response.json();

    })

    .then((data) => {

        if (!Array.isArray(data)) {

            throw new Error(
                "partnerships.json must contain an array"
            );

        }

        programs = normalizeData(data);

        createFilterOptions();

        filterPrograms();

    })

    .catch((error) => {

        console.error(
            "Data loading error:",
            error
        );

        cardsContainer.innerHTML = "";

        emptyState.style.display =
            "none";

        errorState.style.display =
            "block";

        resultCount.textContent =
            "0";

    });


/* =========================================
   Normalize Data
========================================= */

function normalizeData(data) {

    const normalizedPrograms = [];


    data.forEach((item) => {

        if (Array.isArray(item.degrees)) {

            item.degrees.forEach((degree) => {

                normalizedPrograms.push(
                    createNormalizedProgram(
                        item,
                        degree
                    )
                );

            });

        } else {

            normalizedPrograms.push(
                createNormalizedProgram(
                    item,
                    item
                )
            );

        }

    });


    return normalizedPrograms;

}


/* =========================================
   Create normalized program
========================================= */

function createNormalizedProgram(
    parent,
    degree
) {

    const degreeName =
        degree.name ||
        degree.degree ||
        parent.degree ||
        "";


    const programName =
        degree.program ||
        degree.level ||
        parent.program ||
        "";


    const languageRequirements =
        degree.languageRequirements ||
        parent.languageRequirements ||
        getLanguageFromOptions(
            degree.englishOptions ||
            parent.englishOptions
        ) ||
        "";


    const gpaRequirement =
        degree.gpaRequirement ||
        parent.gpaRequirement ||
        getAcademicRequirement(
            degree.academicRequirements ||
            parent.academicRequirements
        ) ||
        "";


    return {

        partnership:
            parent.partnership ||
            degree.partnership ||
            "",


        country:
            parent.country ||
            degree.country ||
            "",


        university:
            parent.university ||
            degree.university ||
            "",


        specialization:
            degree.specialization ||
            degree.subject ||
            parent.specialization ||
            "All Specializations",


        degree:
            degreeName,


        degreeLevel:
            degree.degreeLevel ||
            parent.degreeLevel ||
            getDegreeLevel(
                degreeName,
                programName
            ),


        program:
            programName,


        price:
            degree.price ||
            parent.price ||
            getPriceFromOptions(
                degree.englishOptions ||
                parent.englishOptions
            ) ||
            "",


        scholarshipSupport:
            degree.scholarshipSupport ||
            parent.scholarshipSupport ||
            "To be confirmed",


        languageRequirements:
            languageRequirements,


        gpaRequirement:
            gpaRequirement,


        intake:
            degree.intake ||
            parent.intake ||
            getIntakeFromOptions(
                degree.englishOptions ||
                parent.englishOptions
            ) ||
            "",


        notes:
            degree.notes ||
            parent.notes ||
            ""

    };

}


/* =========================================
   Helpers for new data
========================================= */

function getLanguageFromOptions(options) {

    if (
        !Array.isArray(options) ||
        options.length === 0
    ) {

        return "";

    }


    const first =
        options[0];


    let result = "";


    if (
        first.test
    ) {

        result += first.test;

    }


    if (
        first.overall !== undefined &&
        first.overall !== ""
    ) {

        result +=
            ` ${first.overall} overall`;

    }


    const minSkill =
        first.minSkill ??
        first.minimumSkill;


    if (
        minSkill !== undefined &&
        minSkill !== ""
    ) {

        result +=
            `, no skill below ${minSkill}`;

    }


    return result.trim();

}


function getAcademicRequirement(value) {

    if (!value) {

        return "";

    }


    if (
        typeof value === "string"
    ) {

        return value;

    }


    return (
        value.general ||
        value.academic ||
        ""
    );

}


function getPriceFromOptions(options) {

    if (
        !Array.isArray(options) ||
        options.length === 0
    ) {

        return "";

    }


    const first =
        options[0];


    if (
        first.tuition === undefined ||
        first.tuition === ""
    ) {

        return "";

    }


    return formatPrice(
        first.tuition,
        first.currency || "GBP"
    );

}


function getIntakeFromOptions(options) {

    if (
        !Array.isArray(options) ||
        options.length === 0
    ) {

        return "";

    }


    return (
        options[0].start ||
        options[0].startDate ||
        ""
    );

}


/* =========================================
   Degree Level
========================================= */

function getDegreeLevel(
    degreeName,
    programName
) {

    const degree =
        normalizeText(degreeName);

    const program =
        normalizeText(programName);


    if (
        program.includes("postgraduate") ||
        program.includes("pre-master") ||
        program.includes("pre master")
    ) {

        return "Master";

    }


    if (
        program.includes("undergraduate") ||
        program.includes("foundation") ||
        program.includes("international year one")
    ) {

        return "Bachelor";

    }


    const masterPrefixes = [

        "msc ",
        "msc(",
        "ma ",
        "ma(",
        "mba",
        "llm",
        "master"

    ];


    if (
        masterPrefixes.some(
            (prefix) =>
                degree.startsWith(prefix)
        )
    ) {

        return "Master";

    }


    const bachelorPrefixes = [

        "bsc",
        "ba ",
        "ba(",
        "beng",
        "llb",
        "bmus",
        "bnurs",
        "basc",
        "barch",
        "bba",
        "meng",
        "msci",
        "mphys",
        "mmath",
        "mchem",
        "mbiol",
        "mbiochem",
        "mbiomedsci",
        "menv",
        "marts",
        "mpharm",
        "bachelor"

    ];


    if (
        bachelorPrefixes.some(
            (prefix) =>
                degree.startsWith(prefix)
        )
    ) {

        return "Bachelor";

    }


    return "";

}


/* =========================================
   Filters
========================================= */

function createFilterOptions() {

    clearGeneratedOptions(
        specializationFilter
    );

    clearGeneratedOptions(
        countryFilter
    );

    clearGeneratedOptions(
        partnershipFilter
    );

    clearGeneratedOptions(
        universityFilter
    );


    addOptions(

        specializationFilter,

        getUniqueValues(
            "specialization",
            true
        )

    );


    addOptions(

        countryFilter,

        getUniqueValues(
            "country"
        )

    );


    addOptions(

        partnershipFilter,

        getUniqueValues(
            "partnership"
        )

    );


    addOptions(

        universityFilter,

        getUniqueValues(
            "university"
        )

    );

}


function clearGeneratedOptions(
    selectElement
) {

    while (
        selectElement.options.length > 1
    ) {

        selectElement.remove(1);

    }

}


function getUniqueValues(
    propertyName,
    removeAllSpecializations = false
) {

    return [

        ...new Set(

            programs

                .map(
                    (item) =>
                        item[propertyName]
                )

                .filter(Boolean)

                .filter((value) => {

                    if (
                        removeAllSpecializations &&
                        value === "All Specializations"
                    ) {

                        return false;

                    }

                    return true;

                })

        )

    ].sort(

        (a, b) =>

            String(a).localeCompare(

                String(b),

                undefined,

                {
                    sensitivity: "base"
                }

            )

    );

}


function addOptions(
    selectElement,
    values
) {

    values.forEach((value) => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            value;


        option.textContent =
            value;


        selectElement.appendChild(
            option
        );

    });

}


/* =========================================
   Search and filter
========================================= */

function filterPrograms() {

    const searchValue =
        normalizeSearchText(
            searchInput.value
        );


    const selectedSpecialization =
        specializationFilter.value;


    const selectedDegreeLevel =
        degreeLevelFilter.value;


    const selectedCountry =
        countryFilter.value;


    const selectedPartnership =
        partnershipFilter.value;


    const selectedUniversity =
        universityFilter.value;


    const selectedScholarship =
        scholarshipFilter.value;


    const filteredPrograms =
        programs.filter((item) => {


            const searchableContent =
                normalizeSearchText(`

                    ${item.specialization || ""}

                    ${item.degree || ""}

                    ${item.degreeLevel || ""}

                    ${item.partnership || ""}

                    ${item.country || ""}

                    ${item.university || ""}

                    ${item.program || ""}

                    ${item.languageRequirements || ""}

                    ${item.gpaRequirement || ""}

                    ${item.intake || ""}

                    ${item.notes || ""}

                `);


            const matchesSearch =

                searchValue === "" ||

                searchableContent.includes(
                    searchValue
                );


            const matchesSpecialization =

                selectedSpecialization === "" ||

                item.specialization ===
                    selectedSpecialization;


            const matchesDegreeLevel =

                selectedDegreeLevel === "" ||

                item.degreeLevel ===
                    selectedDegreeLevel;


            const matchesCountry =

                selectedCountry === "" ||

                item.country ===
                    selectedCountry;


            const matchesPartnership =

                selectedPartnership === "" ||

                item.partnership ===
                    selectedPartnership;


            const matchesUniversity =

                selectedUniversity === "" ||

                item.university ===
                    selectedUniversity;


            const matchesScholarship =

                selectedScholarship === "" ||

                item.scholarshipSupport ===
                    selectedScholarship;


            return (

                matchesSearch &&

                matchesSpecialization &&

                matchesDegreeLevel &&

                matchesCountry &&

                matchesPartnership &&

                matchesUniversity &&

                matchesScholarship

            );

        });


    displayPrograms(
        filteredPrograms
    );

}


/* =========================================
   Display
========================================= */

function displayPrograms(data) {

    cardsContainer.innerHTML =
        "";


    resultCount.textContent =
        data.length;


    if (
        data.length === 0
    ) {

        emptyState.style.display =
            "block";

        errorState.style.display =
            "none";

        return;

    }


    emptyState.style.display =
        "none";

    errorState.style.display =
        "none";


    data.forEach((item) => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "result-card";


        card.innerHTML = `

            <div class="card-header">

                <div>

                    <h2>
                        ${escapeHTML(
                            item.specialization
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            item.partnership
                        )}
                    </p>

                    ${
                        hasValue(item.university)
                            ? `
                                <p class="card-university">
                                    ${escapeHTML(
                                        item.university
                                    )}
                                </p>
                            `
                            : ""
                    }

                </div>


                <span class="country-badge">

                    ${escapeHTML(
                        item.country
                    )}

                </span>

            </div>


            <div class="card-body">


                ${
                    hasValue(item.degree)
                        ? `

                            <div class="degree-title-box">

                                <span>
                                    الدرجة / البرنامج
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        item.degree
                                    )}
                                </strong>

                            </div>

                        `
                        : ""
                }


                <div class="data-grid">


                    <div class="data-item">

                        <span>
                            الدرجة الدراسية
                        </span>

                        <strong
                            class="level-badge"
                        >

                            ${getDegreeLevelLabel(
                                item.degreeLevel
                            )}

                        </strong>

                    </div>


                    ${
                        hasValue(item.program)
                            ? `

                                <div class="data-item">

                                    <span>
                                        المرحلة / البرنامج
                                    </span>

                                    <strong>

                                        ${escapeHTML(
                                            item.program
                                        )}

                                    </strong>

                                </div>

                            `
                            : ""
                    }


                    ${
                        hasValue(item.price)
                            ? `

                                <div class="data-item">

                                    <span>
                                        الرسوم الدراسية
                                    </span>

                                    <strong>

                                        ${escapeHTML(
                                            item.price
                                        )}

                                    </strong>

                                </div>

                            `
                            : ""
                    }


                    ${
                        hasValue(item.intake)
                            ? `

                                <div class="data-item">

                                    <span>
                                        موعد الدراسة
                                    </span>

                                    <strong>

                                        ${escapeHTML(
                                            item.intake
                                        )}

                                    </strong>

                                </div>

                            `
                            : ""
                    }


                    <div class="data-item">

                        <span>
                            دعم الابتعاث
                        </span>

                        <strong
                            class="
                                scholarship-badge
                                ${getScholarshipClass(
                                    item.scholarshipSupport
                                )}
                            "
                        >

                            ${getScholarshipLabel(
                                item.scholarshipSupport
                            )}

                        </strong>

                    </div>


                </div>


                <div class="requirements-section">

                    <h3>
                        متطلبات القبول
                    </h3>


                    <div class="requirements-grid">

                        <div class="requirement-item">

                            <span>
                                متطلبات اللغة
                            </span>

                            <strong>

                                ${getRequirementValue(
                                    item.languageRequirements
                                )}

                            </strong>

                        </div>


                        <div class="requirement-item">

                            <span>
                                المعدل المطلوب
                            </span>

                            <strong>

                                ${getRequirementValue(
                                    item.gpaRequirement
                                )}

                            </strong>

                        </div>

                    </div>

                </div>


                ${
                    hasValue(item.notes)
                        ? `

                            <div class="notes-box">

                                <span>
                                    ملاحظات
                                </span>

                                <strong>

                                    ${escapeHTML(
                                        item.notes
                                    )}

                                </strong>

                            </div>

                        `
                        : ""
                }


            </div>

        `;


        cardsContainer.appendChild(
            card
        );

    });

}


/* =========================================
   Requirement display
========================================= */

function getRequirementValue(value) {

    if (
        !hasValue(value)
    ) {

        return "سيتم إضافة المتطلبات";

    }


    return escapeHTML(value);

}


/* =========================================
   Degree Level
========================================= */

function getDegreeLevelLabel(level) {

    if (
        level === "Bachelor"
    ) {

        return "بكالوريوس";

    }


    if (
        level === "Master"
    ) {

        return "ماجستير";

    }


    return "غير محدد";

}


/* =========================================
   Scholarship
========================================= */

function getScholarshipClass(status) {

    if (
        status === "Supported"
    ) {

        return "supported";

    }


    if (
        status === "Not Supported"
    ) {

        return "not-supported";

    }


    return "to-be-confirmed";

}


function getScholarshipLabel(status) {

    if (
        status === "Supported"
    ) {

        return "مدعوم";

    }


    if (
        status === "Not Supported"
    ) {

        return "غير مدعوم";

    }


    return "غير مؤكد";

}


/* =========================================
   Price
========================================= */

function formatPrice(
    price,
    currency
) {

    if (
        price === "" ||
        price === null ||
        price === undefined
    ) {

        return "";

    }


    if (
        typeof price !== "number"
    ) {

        return String(price);

    }


    const formatted =
        new Intl.NumberFormat(
            "en-GB"
        ).format(price);


    if (
        currency === "GBP"
    ) {

        return `£${formatted}`;

    }


    if (
        currency === "USD"
    ) {

        return `$${formatted}`;

    }


    if (
        currency === "EUR"
    ) {

        return `€${formatted}`;

    }


    return `${formatted} ${currency || ""}`;

}


/* =========================================
   Helpers
========================================= */

function normalizeText(value) {

    return String(
        value || ""
    )
        .toLowerCase()
        .trim();

}


function normalizeSearchText(value) {

    return String(
        value || ""
    )

        .toLowerCase()

        .replace(/[أإآ]/g, "ا")

        .replace(/ة/g, "ه")

        .replace(/ى/g, "ي")

        .replace(/\s+/g, " ")

        .trim();

}


function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value === null ||
        value === undefined ||
        value === ""

            ? "-"

            : String(value);


    return div.innerHTML;

}


function hasValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return false;

    }


    const text =
        String(value)
            .trim();


    if (
        text === ""
    ) {

        return false;

    }


    const placeholders = [

        "سيتم إضافته",
        "سيتم اضافه",
        "سيتم إضافة السعر",
        "سيتم إضافة المعدل",
        "سيتم إضافة متطلبات اللغة",
        "to be added"

    ];


    return !placeholders
        .map(
            normalizeSearchText
        )
        .includes(
            normalizeSearchText(text)
        );

}


/* =========================================
   Reset
========================================= */

function resetFilters() {

    searchInput.value =
        "";


    specializationFilter.value =
        "";


    degreeLevelFilter.value =
        "";


    countryFilter.value =
        "";


    partnershipFilter.value =
        "";


    universityFilter.value =
        "";


    scholarshipFilter.value =
        "";


    filterPrograms();


    searchInput.focus();

}


/* =========================================
   Events
========================================= */

searchInput.addEventListener(
    "input",
    filterPrograms
);


specializationFilter.addEventListener(
    "change",
    filterPrograms
);


degreeLevelFilter.addEventListener(
    "change",
    filterPrograms
);


countryFilter.addEventListener(
    "change",
    filterPrograms
);


partnershipFilter.addEventListener(
    "change",
    filterPrograms
);


universityFilter.addEventListener(
    "change",
    filterPrograms
);


scholarshipFilter.addEventListener(
    "change",
    filterPrograms
);


resetButton.addEventListener(
    "click",
    resetFilters
);
