const searchInput = document.getElementById("searchInput");

const specializationFilter = document.getElementById(
    "specializationFilter"
);

const degreeLevelFilter = document.getElementById(
    "degreeLevelFilter"
);

const countryFilter = document.getElementById(
    "countryFilter"
);

const partnershipFilter = document.getElementById(
    "partnershipFilter"
);
const universityFilter = document.getElementById(
    "universityFilter"
);

const scholarshipFilter = document.getElementById(
    "scholarshipFilter"
);

const resetButton = document.getElementById("resetButton");

const cardsContainer = document.getElementById(
    "cardsContainer"
);

const resultCount = document.getElementById(
    "resultCount"
);

const emptyState = document.getElementById(
    "emptyState"
);

const errorState = document.getElementById(
    "errorState"
);


let programs = [];


/* =========================================
   تحميل البيانات
========================================= */

fetch("./partnerships.json")

    .then((response) => {

        if (!response.ok) {

            throw new Error(
                "Failed to load data"
            );

        }

        return response.json();

    })

    .then((data) => {

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
   تحويل البيانات إلى شكل موحد
========================================= */

function normalizeData(data) {

    const normalizedPrograms = [];


    data.forEach((item) => {


        /* =================================
           الشكل الجديد
           University + Degrees
        ================================= */

        if (Array.isArray(item.degrees)) {


            item.degrees.forEach(
                (degree) => {


                    const degreeName =

                        degree.name ||

                        degree.degree ||

                        "";


                    normalizedPrograms.push({

                        partnership:
                            item.partnership ||
                            "",

                        country:
                            item.country ||
                            "",

                        university:
                            item.university ||
                            "",


                        specialization:

                            degree.specialization ||

                            degree.subject ||

                            "All Specializations",


                        degree:
                            degreeName,


                        degreeLevel:
                            getDegreeLevel(
                                degreeName,
                                degree.program ||
                                degree.level ||
                                ""
                            ),


                        program:

                            degree.program ||

                            degree.level ||

                            item.program ||

                            "",


                        price:

                            degree.price ||

                            item.price ||

                            "سيتم إضافة السعر",


                        scholarshipSupport:

                            degree.scholarshipSupport ||

                            item.scholarshipSupport ||

                            "To be confirmed",


                        languageRequirements:

                            degree.languageRequirements ||

                            item.languageRequirements ||

                            "سيتم إضافة متطلبات اللغة",


                        gpaRequirement:

                            degree.gpaRequirement ||

                            item.gpaRequirement ||

                            "سيتم إضافة المعدل",


                        intake:

                            degree.intake ||

                            item.intake ||

                            "سيتم إضافته",


                        notes:

                            degree.notes ||

                            item.notes ||

                            ""

                    });

                }
            );


        } else {


            /* =================================
               الشكل القديم
               CEG / Study Group / Shorelight
            ================================= */


            const degreeName =

                item.degree ||

                item.program ||

                "";


            normalizedPrograms.push({

                ...item,


                degree:
                    degreeName,


                degreeLevel:
                    getDegreeLevel(
                        degreeName,
                        item.program || ""
                    )

            });

        }

    });


    return normalizedPrograms;

}


/* =========================================
   تحديد بكالوريوس / ماجستير
========================================= */

function getDegreeLevel(
    degreeName,
    programName
) {

    const degree = String(
        degreeName || ""
    )
        .trim()
        .toLowerCase();


    const program = String(
        programName || ""
    )
        .trim()
        .toLowerCase();


    /*
       ماجستير مباشر
       أو Integrated Master
    */

    const masterPrefixes = [

        "msc",
        "meng",
        "msci",
        "mphys",
        "marts",
        "mbiol",
        "mbiochem",
        "mmath",
        "menv",
        "mpharm",
        "mpharm",
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


    /*
       بكالوريوس
    */

    const bachelorPrefixes = [

        "bsc",
        "ba ",
        "ba(",
        "beng",
        "llb",
        "bmus",
        "bnurs",
        "basc",
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


    /*
       لو الاسم مش واضح،
       نستخدم program
    */

    if (
        program.includes(
            "postgraduate"
        )
    ) {

        return "Master";

    }


    if (
        program.includes(
            "master"
        )
    ) {

        return "Master";

    }


    if (
        program.includes(
            "undergraduate"
        )
    ) {

        return "Bachelor";

    }


    return "";

}


/* =========================================
   إنشاء الفلاتر
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
            "specialization"
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


/* =========================================
   حذف الخيارات القديمة
========================================= */

function clearGeneratedOptions(
    selectElement
) {

    while (
        selectElement.options.length >
        1
    ) {

        selectElement.remove(1);

    }

}


/* =========================================
   القيم الفريدة
========================================= */

function getUniqueValues(
    propertyName
) {


    return [

        ...new Set(

            programs

                .map(
                    (item) =>
                        item[
                            propertyName
                        ]
                )

                .filter(Boolean)

        )

    ].sort(

        (a, b) =>

            a.localeCompare(

                b,

                undefined,

                {
                    sensitivity:
                        "base"
                }

            )

    );

}


/* =========================================
   إضافة الخيارات
========================================= */

function addOptions(
    selectElement,
    values
) {


    values.forEach(
        (value) => {


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

        }
    );

}


/* =========================================
   البحث والفلاتر
========================================= */

function filterPrograms() {


    const searchValue =
        normalizeText(
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
    
    const selectedScholarship =
    scholarshipFilter.value;


    const selectedScholarship =
        scholarshipFilter.value;


    const filteredPrograms =
        programs.filter(
            (item) => {


                const searchableContent =
                    normalizeText(`

                        ${item.specialization || ""}

                        ${item.degree || ""}

                        ${item.degreeLevel || ""}

                        ${item.partnership || ""}

                        ${item.country || ""}

                        ${item.university || ""}

                        ${item.program || ""}

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

            }
        );


    displayPrograms(
        filteredPrograms
    );

}


/* =========================================
   عرض النتائج
========================================= */

function displayPrograms(
    data
) {


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


    data.forEach(
        (item) => {


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

                    </div>


                    <span class="country-badge">

                        ${escapeHTML(
                            item.country
                        )}

                    </span>

                </div>


                <div class="card-body">

                    <div class="data-grid">


                        <div class="data-item">

                            <span>
                                الجامعة
                            </span>

                            <strong>
                                ${escapeHTML(
                                    item.university
                                )}
                            </strong>

                        </div>


                        <div class="data-item">

                            <span>
                                الدرجة الدراسية
                            </span>

                            <strong>
                                ${getDegreeLevelLabel(
                                    item.degreeLevel
                                )}
                            </strong>

                        </div>


                        <div class="data-item">

                            <span>
                                الدرجة / البرنامج
                            </span>

                            <strong>
                                ${escapeHTML(
                                    item.degree
                                )}
                            </strong>

                        </div>


                        <div class="data-item">

                            <span>
                                المرحلة / المسار
                            </span>

                            <strong>
                                ${escapeHTML(
                                    item.program
                                )}
                            </strong>

                        </div>


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


                        <div
                            class="
                                data-item
                                full-width
                            "
                        >

                            <span>
                                ملاحظات
                            </span>

                            <strong>
                                ${escapeHTML(
                                    item.notes
                                )}
                            </strong>

                        </div>


                    </div>

                </div>

            `;


            cardsContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================
   اسم الدرجة بالعربي
========================================= */

function getDegreeLevelLabel(
    level
) {


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

function getScholarshipClass(
    status
) {


    if (
        status === "Supported"
    ) {

        return "supported";

    }


    if (
        status ===
        "Not Supported"
    ) {

        return "not-supported";

    }


    return "to-be-confirmed";

}


function getScholarshipLabel(
    status
) {


    if (
        status === "Supported"
    ) {

        return "مدعوم";

    }


    if (
        status ===
        "Not Supported"
    ) {

        return "غير مدعوم";

    }


    return "غير مؤكد";

}


/* =========================================
   Helpers
========================================= */

function normalizeText(
    value
) {


    return String(
        value || ""
    )

        .toLowerCase()

        .trim();

}


function escapeHTML(
    value
) {


    const div =
        document.createElement(
            "div"
        );


    div.textContent =

        value ||

        "سيتم إضافته";


    return div.innerHTML;

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


    scholarshipFilter.value =
        "";

    universityFilter.value =
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
