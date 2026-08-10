/* =========================================
   Elements
========================================= */

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

const pathwayFilter =
    document.getElementById("pathwayFilter");

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
                `Failed to load partnerships.json: ${response.status}`
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

        /*
         * New / nested format:
         * university object containing degrees[]
         */

        if (Array.isArray(item.degrees)) {

            item.degrees.forEach((degree) => {

                normalizedPrograms.push(
                    createNormalizedProgram(
                        item,
                        degree
                    )
                );

            });

            return;

        }


        /*
         * Old flat format
         */

        normalizedPrograms.push(
            createNormalizedProgram(
                item,
                item
            )
        );

    });


    return normalizedPrograms;

}


/* =========================================
   Build normalized record
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


    const pathwayType =
        degree.pathwayType ||
        parent.pathwayType ||
        detectPathwayType(programName) ||
        "";


    const pathway =
        degree.pathway ||
        parent.pathway ||
        "";


    const englishOptions = normalizeEnglishOptions(
        degree.englishOptions ||
        parent.englishOptions ||
        []
    );


    const academicRequirements =
        normalizeAcademicRequirements(
            degree.academicRequirements ||
            parent.academicRequirements ||
            null,
            degree.gpaRequirement ||
            parent.gpaRequirement ||
            ""
        );


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


        pathwayType:
            pathwayType,


        pathway:
            pathway,


        academicRequirements:
            academicRequirements,


        price:
            degree.price ||
            parent.price ||
            "",


        scholarshipSupport:
            degree.scholarshipSupport ||
            parent.scholarshipSupport ||
            "To be confirmed",


        languageRequirements:
            degree.languageRequirements ||
            parent.languageRequirements ||
            "",


        gpaRequirement:
            degree.gpaRequirement ||
            parent.gpaRequirement ||
            "",


        intake:
            degree.intake ||
            parent.intake ||
            "",


        degreeEntry:
            degree.degreeEntry ||
            parent.degreeEntry ||
            "",


        internshipAvailable:
            getBooleanValue(
                degree.internshipAvailable,
                parent.internshipAvailable
            ),


        englishOptions:
            englishOptions,


        sourceYear:
            degree.sourceYear ||
            parent.sourceYear ||
            "",


        source:
            degree.source ||
            parent.source ||
            "",


        notes:
            degree.notes ||
            parent.notes ||
            ""

    };

}


/* =========================================
   Academic Requirements
========================================= */

function normalizeAcademicRequirements(
    value,
    fallback
) {

    if (!value) {

        return {
            general: fallback || "",
            countrySpecific: false
        };

    }


    if (typeof value === "string") {

        return {
            general: value,
            countrySpecific: false
        };

    }


    return {

        general:
            value.general ||
            value.academic ||
            fallback ||
            "",

        countrySpecific:
            Boolean(
                value.countrySpecific
            )

    };

}


/* =========================================
   English Options
========================================= */

function normalizeEnglishOptions(options) {

    if (!Array.isArray(options)) {

        return [];

    }


    return options.map((option) => ({

        test:
            option.test ||
            "UKVI IELTS",

        overall:
            option.overall ??
            "",

        minSkill:
            option.minSkill ??
            option.minimumSkill ??
            "",

        duration:
            option.duration ||
            "",

        tuition:
            option.tuition ??
            "",

        currency:
            option.currency ||
            "GBP",

        start:
            option.start ||
            option.startDate ||
            "",

        end:
            option.end ||
            option.endDate ||
            "",

        degreeEntry:
            option.degreeEntry ||
            "",

        internshipAvailable:
            Boolean(
                option.internshipAvailable
            ),

        extraSupport:
            option.extraSupport ||
            ""

    }));

}


/* =========================================
   Boolean helper
========================================= */

function getBooleanValue(
    first,
    second
) {

    if (typeof first === "boolean") {
        return first;
    }

    if (typeof second === "boolean") {
        return second;
    }

    return false;

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


    /*
     * IMPORTANT:
     * Program type wins first.
     *
     * MEng / MSci / MPhys can still be
     * undergraduate integrated master's.
     */

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


    const postgraduatePrefixes = [

        "msc ",
        "msc(",
        "ma ",
        "ma(",
        "mba",
        "llm",
        "mph ",
        "mph(",
        "master"

    ];


    if (
        postgraduatePrefixes.some(
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
        "bachelor",

        /*
         * Integrated undergraduate awards
         */

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
        "mpharm"

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
   Detect pathway type
========================================= */

function detectPathwayType(programName) {

    const program =
        normalizeText(programName);


    if (
        program.includes(
            "foundation"
        )
    ) {

        return "Foundation";

    }


    if (
        program.includes(
            "international year one"
        )
    ) {

        return "International Year One";

    }


    if (
        program.includes(
            "pre-master"
        ) ||
        program.includes(
            "pre master"
        )
    ) {

        return "Pre-Master's";

    }


    return "";

}


/* =========================================
   Create filters
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

    clearGeneratedOptions(
        pathwayFilter
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


    addOptions(

        pathwayFilter,

        getUniqueValues(
            "pathwayType"
        )

    );

}


/* =========================================
   Clear generated options
========================================= */

function clearGeneratedOptions(
    selectElement
) {

    while (
        selectElement.options.length > 1
    ) {

        selectElement.remove(1);

    }

}


/* =========================================
   Unique Values
========================================= */

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


/* =========================================
   Add select options
========================================= */

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
   Filter
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


    const selectedPathway =
        pathwayFilter.value;


    const selectedScholarship =
        scholarshipFilter.value;


    const filteredPrograms =
        programs.filter((item) => {

            const optionsText =
                item.englishOptions
                    .map((option) => `

                        ${option.test}

                        ${option.overall}

                        ${option.minSkill}

                        ${option.duration}

                        ${option.tuition}

                        ${option.start}

                        ${option.end}

                        ${option.degreeEntry}

                    `)
                    .join(" ");


            const searchableContent =
                normalizeSearchText(`

                    ${item.specialization || ""}

                    ${item.degree || ""}

                    ${item.degreeLevel || ""}

                    ${item.partnership || ""}

                    ${item.country || ""}

                    ${item.university || ""}

                    ${item.program || ""}

                    ${item.pathwayType || ""}

                    ${item.pathway || ""}

                    ${item.academicRequirements.general || ""}

                    ${item.languageRequirements || ""}

                    ${item.gpaRequirement || ""}

                    ${item.intake || ""}

                    ${item.degreeEntry || ""}

                    ${item.notes || ""}

                    ${optionsText}

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


            const matchesPathway =

                selectedPathway === "" ||

                item.pathwayType ===
                    selectedPathway;


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

                matchesPathway &&

                matchesScholarship

            );

        });


    displayPrograms(
        filteredPrograms
    );

}


/* =========================================
   Display Programs
========================================= */

function displayPrograms(data) {

    cardsContainer.innerHTML =
        "";


    resultCount.textContent =
        data.length;


    if (data.length === 0) {

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
                        hasValue(
                            item.university
                        )
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
                                    الدرجة الجامعية
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
                        hasValue(item.pathwayType)
                            ? `

                                <div class="data-item">

                                    <span>
                                        نوع المسار
                                    </span>

                                    <strong
                                        class="pathway-badge"
                                    >

                                        ${escapeHTML(
                                            item.pathwayType
                                        )}

                                    </strong>

                                </div>

                            `
                            : ""
                    }


                    ${
                        hasValue(item.pathway)
                            ? `

                                <div class="data-item">

                                    <span>
                                        مسار Kaplan
                                    </span>

                                    <strong>

                                        ${escapeHTML(
                                            item.pathway
                                        )}

                                    </strong>

                                </div>

                            `
                            : ""
                    }


                    ${
                        hasValue(item.program)
                            ? `

                                <div class="data-item">

                                    <span>
                                        البرنامج / المرحلة
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
                        hasValue(
                            item.academicRequirements.general
                        )
                            ? `

                                <div class="data-item full-width">

                                    <span>
                                        المتطلبات الأكاديمية
                                    </span>

                                    <strong>

                                        ${escapeHTML(
                                            item.academicRequirements.general
                                        )}

                                        ${
                                            item.academicRequirements.countrySpecific
                                                ? `
                                                    <br>
                                                    <small>
                                                        تختلف التفاصيل حسب دولة الطالب.
                                                    </small>
                                                `
                                                : ""
                                        }

                                    </strong>

                                </div>

                            `
                            : ""
                    }


                    ${
                        item.englishOptions.length === 0 &&
                        hasValue(item.languageRequirements)

                            ? `

                                <div class="data-item">

                                    <span>
                                        متطلبات اللغة
                                    </span>

                                    <strong>

                                        ${escapeHTML(
                                            item.languageRequirements
                                        )}

                                    </strong>

                                </div>

                            `
                            : ""
                    }


                    ${
                        hasValue(item.gpaRequirement) &&
                        !hasValue(
                            item.academicRequirements.general
                        )
                            ? `

                                <div class="data-item">

                                    <span>
                                        المعدل المطلوب
                                    </span>

                                    <strong>

                                        ${escapeHTML(
                                            item.gpaRequirement
                                        )}

                                    </strong>

                                </div>

                            `
                            : ""
                    }


                    ${
                        item.englishOptions.length === 0 &&
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


                    ${
                        hasValue(item.degreeEntry)
                            ? `

                                <div class="data-item">

                                    <span>
                                        دخول الجامعة
                                    </span>

                                    <strong>

                                        ${escapeHTML(
                                            item.degreeEntry
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


                    ${
                        item.internshipAvailable
                            ? `

                                <div class="data-item">

                                    <span>
                                        Internship
                                    </span>

                                    <strong>
                                        متاح
                                    </strong>

                                </div>

                            `
                            : ""
                    }


                    ${
                        hasValue(item.sourceYear)
                            ? `

                                <div class="data-item">

                                    <span>
                                        سنة البيانات
                                    </span>

                                    <strong>

                                        ${escapeHTML(
                                            item.sourceYear
                                        )}

                                    </strong>

                                </div>

                            `
                            : ""
                    }


                </div>


                ${createEnglishOptionsTable(
                    item.englishOptions
                )}


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
   English Options Table
========================================= */

function createEnglishOptionsTable(
    options
) {

    if (
        !Array.isArray(options) ||
        options.length === 0
    ) {

        return "";

    }


    const rows =
        options.map((option) => `

            <tr>

                <td>

                    ${formatIELTS(option)}

                </td>


                <td>

                    ${escapeHTML(
                        option.duration ||
                        "-"
                    )}

                </td>


                <td>

                    ${formatTuition(
                        option.tuition,
                        option.currency
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        option.start ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        option.end ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        option.degreeEntry ||
                        "-"
                    )}

                </td>

            </tr>

        `).join("");


    return `

        <div class="options-section">

            <h3>
                خيارات القبول والمسار
            </h3>


            <div class="options-table-wrapper">

                <table class="options-table">

                    <thead>

                        <tr>

                            <th>
                                IELTS
                            </th>

                            <th>
                                المدة
                            </th>

                            <th>
                                الرسوم
                            </th>

                            <th>
                                البداية
                            </th>

                            <th>
                                النهاية
                            </th>

                            <th>
                                دخول الجامعة
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>

        </div>

    `;

}


/* =========================================
   IELTS formatting
========================================= */

function formatIELTS(option) {

    if (
        option.overall === "" &&
        option.minSkill === ""
    ) {

        return "-";

    }


    let text = "";


    if (
        option.overall !== ""
    ) {

        text += `${escapeHTML(
            option.overall
        )} overall`;

    }


    if (
        option.minSkill !== ""
    ) {

        text += ` / no skill below ${escapeHTML(
            option.minSkill
        )}`;

    }


    return text;

}


/* =========================================
   Tuition formatting
========================================= */

function formatTuition(
    tuition,
    currency
) {

    if (
        tuition === "" ||
        tuition === null ||
        tuition === undefined
    ) {

        return "-";

    }


    if (
        typeof tuition === "number"
    ) {

        const formatted =
            new Intl.NumberFormat(
                "en-GB"
            ).format(tuition);


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


        return `${formatted} ${escapeHTML(
            currency || ""
        )}`;

    }


    return escapeHTML(tuition);

}


/* =========================================
   Degree Level Label
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
   Helpers
========================================= */

function normalizeText(value) {

    return String(
        value || ""
    )
        .toLowerCase()
        .trim();

}


/*
 * Search normalization
 * Handles common Arabic characters too.
 */

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


    /*
     * Hide old placeholders
     */

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

    pathwayFilter.value =
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


pathwayFilter.addEventListener(
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
