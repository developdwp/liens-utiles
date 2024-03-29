const repo = "https://api.github.com/repos/aelweak/liens-utiles";

const main = document.querySelector("main");

// Format URL, italic words, @mention

function formatDiscord(str) {
    const formatStr = str
        .replace(/(https?:\/\/[^\s]+)/g, (url) => `<${url}>`) // Detect url and add < > each sides
        .replace(/\(([^)]+)\)/g, (italic) => `*${italic}*`); // Detect ( ) and add italic style to string inside
    return formatStr;
}

// Format ids/classes/anchors name

function formatTitle(str) {
    const formatTitle = str
        .normalize("NFD") // Unicode normalization form (NFD = canonical decomposition)
        .replace(/[\u0300-\u036f-()\.]/g, "") // Remove accents, dot and parenthesis
        .replace(/[^a-zA-Z0-9-Ü-ü-\.]/g, "-")
        .replace("---", "-")
        .toLowerCase();
    return formatTitle;
}

// Format specific URL

function formatURL(url) {
    const formatURL = url
        .replace(/^https?:\/\/(www.)?/, "") // Delete http://, http://www., https:// and https://www.
        .replace("youtube.com/@", "")
        .replace("ecole-du-web.net/p/", "Ecole du Web - ")
        .replace("udemy.com/course/", "Udemy - ")
        .replace(/\/$/, "");
    return formatURL;
}

// Format date (fr)

function formatDateFR(date) {
    const formatDate = new Date(date).toLocaleDateString();
    return formatDate;
}

// Format commit message ([AJOUT] & [SUPPR])

function formatCommitMsg(msg) {
    const formatMsg = msg
        .replaceAll("[Ajout]", "<span class='commit-msg-add'>[Ajout]</span>") // Add green color to [Ajout] tag
        .replaceAll(
            "[Suppr.]",
            "<span class='commit-msg-delete'>[Suppr.]</span>"
        ) // Add red color to [Suppr.] tag
        .replace(
            /\(([^)]+)\)/g,
            (italic) => `<span class='commit-msg-italic'>${italic}</span>`
        ) // Detect ( ) and add italic style to string inside
        .replace(/\B@\w+/g, (profile) => {
            const formatProfile = profile.substring(1);
            return `- 🙏<a href="https://github.com/${formatProfile}" target="_blank">${formatProfile}</a>`;
        }) // Detect @mention and add github link to it
        .replaceAll("||", "<li>");
    return formatMsg;
}

// Display "Copié !" on Discord icon click

function animClick(target) {
    const titre = target.closest(".titles");
    const copyMsg = document.createElement("span");
    copyMsg.classList.add("copyMsg");
    copyMsg.innerHTML = "Copié !";
    titre.append(copyMsg);

    setTimeout(() => {
        copyMsg.remove();
    }, 500);
}

Promise.all([
    fetch("./assets/data/data.json").then((res1) => res1.json()),
    fetch(repo).then((res2) => res2.json()),
    fetch(`${repo}/commits?per_page=20`).then((res3) => res3.json()),
])
    .then(([data, { stargazers_count }, commits]) => {
        // Last update (last commit) date

        const lastUpdateContainer = document.querySelector(".last-update");
        lastUpdateContainer.innerHTML = `Dernière MAJ : ${formatDateFR(
            commits[0]?.commit.author.date
        )} <button type="button" class="toggle-changelog">(Notes de mise à jour)</button>`;

        const navbar = document.querySelector("nav");
        const navList = document.createElement("ul");
        let navContent = "";

        const fragSection = document.createDocumentFragment();

        Object.entries(data).forEach(([sectionName, sectionData]) => {
            const { items } = sectionData;
            const section = document.createElement("section");
            const sectionTitle = formatTitle(sectionName);

            // Nav links

            navContent += `<li data-name='${sectionTitle}'><a href='#${sectionTitle}'>${sectionName}</a></li>`;

            // Main links

            // Add a section css class (for left vertical colored line as a ::before)
            section.classList.add(sectionTitle);

            // Content title

            let sectionContent = `<h2 class="section-title" style="background:url('./assets/images/ico_${formatTitle(
                sectionName
            )}.webp') left center no-repeat;background-size: 2.8rem;"><a id="${sectionTitle}" href="#${sectionTitle}">${sectionName}</a></h2>`;
            sectionContent += `<ul>`;

            // Content links

            items.map(({ title, links }) => {
                const subSectionId = formatTitle(`${sectionName}-${title}`);
                sectionContent += `
                    <li class="titles" data-section=${sectionName}><a id="${subSectionId}" href="#${subSectionId}">${title}</a>
                        <svg class="copyToDiscord" width="30px" height="30px" viewBox="-50 -80 350 350" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
                            <g>
                                <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill-rule="nonzero"></path>
                            </g>
                        </svg>
                    </li>`;

                // Section links

                sectionContent += "<li><ul>";

                links.map(({ name, info = "", url }) => {
                    if (!url) return;

                    sectionContent += name
                        ? `<li class='links'>- ${name} ${
                              info && `<span class="infos">(${info})</span> `
                          }: `
                        : "";

                    sectionContent += Array.isArray(url)
                        ? "<ul>" +
                          url
                              .map(
                                  (link) =>
                                      `<li><a href="${link}" target="_blank">${formatURL(
                                          link
                                      )}</a></li>`
                              )
                              .join("") +
                          "</ul>"
                        : `<a href="${url}" target="_blank">${formatURL(
                              url
                          )}</a>`;
                });
                sectionContent += "</ul></li>";
            });
            section.innerHTML = sectionContent;
            fragSection.appendChild(section);
        });

        main.appendChild(fragSection);

        navContent += `<li class="nav-extralinks github-stars"><a href='https://github.com/Aelweak/liens-utiles' target="_blank">Mettre une ⭐ sur GitHub</a></li>
        <li><a href='https://github.com/Aelweak/liens-utiles/issues/new/choose' target="_blank">Proposer/Signaler un lien</a></li>`;

        navList.innerHTML = navContent;
        navbar.append(navList);

        // ************************ //
        // Github stars (footer & nav)
        // ************************ //

        const purpose = 128; // 128 for "Starstruck x2/Silver" achievements badge
        const starsNeeded = purpose - stargazers_count;
        if (stargazers_count < purpose) {
            const githubStars = document.querySelectorAll(".github-stars");
            githubStars.forEach((link) =>
                link.insertAdjacentHTML(
                    "beforeend",
                    `<span>(Plus que ${starsNeeded} pour le badge 🙏)</span>`
                )
            );
        }

        // ************************ //
        // Nav (link active observer)
        // ************************ //

        const sections = document.querySelectorAll("section");
        const navLink = document.querySelectorAll("nav li");

        function handleIntersect(entries) {
            entries.forEach((entry) => {
                const {
                    isIntersecting,
                    target: { className },
                } = entry;

                if (isIntersecting) {
                    navLink.forEach((link) => {
                        if (link.dataset.name === className) {
                            link.classList.add("active");
                        } else {
                            link.classList.remove("active");
                        }
                    });
                }
            });
        }

        const observer = new IntersectionObserver(handleIntersect, {
            rootMargin: "-50% 0px",
            threshold: 0,
        });

        sections.forEach((section) => {
            observer.observe(section);
        });

        // ************* //
        // Changelog modal
        // ************* //

        const changelogContainer = document.querySelector(
            ".changelog-container"
        );
        const changelogBtn = document.querySelector(".toggle-changelog");
        const closeModalBtn = document.querySelector(
            ".changelog-container button"
        );
        const changelogList = document.querySelector(".changelog-container ul");

        // Group commits by date

        const result = commits.reduce((groupedDate, message) => {
            const date = new Date(message.commit.committer.date)
                .toISOString()
                .substring(0, 10);
            if (groupedDate[date] == null) groupedDate[date] = [];
            groupedDate[date].push(message);
            return groupedDate;
        }, {});

        // Commits details

        const fragment = document.createDocumentFragment();
        const properties = Object.keys(result);

        properties.forEach((item) => {
            const newLine = document.createElement("li");
            newLine.classList.add("commit-details");

            let messagesFromCommit = `<ul><li class="commit-date">${formatDateFR(
                item
            )}</li>`;
            result[item].forEach(
                (char) =>
                    (messagesFromCommit += `<li>${char.commit.message}</li>`)
            );
            messagesFromCommit += "</ul>";
            newLine.innerHTML = `${formatCommitMsg(messagesFromCommit)}`;
            fragment.appendChild(newLine);
        });

        changelogList.appendChild(fragment);

        // Open/Close changelog modal

        changelogBtn.addEventListener("click", () => {
            changelogContainer.showModal();
            changelogContainer.setAttribute("aria-hidden", false);
            document.body.classList.add("stop-scroll");
        });

        closeModalBtn.addEventListener("click", () => {
            changelogContainer.close();
            changelogContainer.setAttribute("aria-hidden", true);
            document.body.classList.remove("stop-scroll");
        });

        // ********************************************************** //
        // Copy (from Discord icon) to clipboard (with Discord markdown)
        // ********************************************************** //

        const discordIcons = document.querySelectorAll(".copyToDiscord");

        discordIcons.forEach((title) => {
            title.addEventListener("click", ({ target }) => {
                const parent = target.closest("li");
                navigator.clipboard.writeText(
                    `>>> **__${parent.dataset.section} - ${
                        parent.innerText
                    }__**\r${formatDiscord(
                        parent.nextElementSibling.innerText
                    )}`
                );
                animClick(target);
            });
        });

        // ************** //
        // Scroll to anchor
        // ************** //

        const { hash } = window.location;
        hash && document.querySelector(hash)?.scrollIntoView();
    })
    .catch((error) => {
        console.error(error);
    });
