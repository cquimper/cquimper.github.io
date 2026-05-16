async function loadPublications() {
    const params = new URLSearchParams(window.location.search);

    try {
        const response = await fetch('publications.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");

        // --- 1. Logic: Display Options (Replicating $_GET logic) ---
        const display_cv_mode = params.has('cvmode');
        const nserc_mode = params.has('nserc');
        const display_acceptance_rates = (params.get('acceptancerate') === 'true') || (!params.has('acceptancerate') && display_cv_mode);
        const display_files = (!params.has('files') && !display_cv_mode) || (params.get('files') === 'true');
        const display_author_links = (!params.has('authorlinks') && !display_cv_mode && !nserc_mode) || (params.get('authorlinks') === 'true');
        const display_awards = !params.has('awards') || (params.get('awards') === 'true');
        const display_numbers = (params.get('numbers') === 'true') || (!params.has('numbers') && display_cv_mode);
        const short_names = (params.get('shortnames') === 'true') || (!params.has('shortnames') && display_cv_mode);

        // --- 2. Logic: Date Handling ---
        let today_string = "";
        const todayParam = params.get('today');
        if (todayParam && !isNaN(todayParam)) {
            // today_string = todayASString(todayParam);
            today_string = todayParam;
        } else {
            const now = new Date();
            const y = now.getUTCFullYear();
            const m = String(now.getUTCMonth() + 1).padStart(2, '0');
            const d = String(now.getUTCDate()).padStart(2, '0');
            today_string = `${y}${m}${d}`;
        }

        const open_list = display_numbers ? "<ol>" : "<ul>";
        const close_list = display_numbers ? "</ol>" : "</ul>";

        // --- 3. Helper Functions ---
        function getFileLink(label, path) {
            const url = path.startsWith('http') ? path : `publications/${path}`;
            return `<a href="${url}">${label}</a> `;
        }

        function convertToNsercName(authorNode) {
            const isStudent = authorNode.getAttribute('student') === 'yes';
            const prefix = isStudent ? "*" : "";
            const shortname = authorNode.querySelector('shortname').textContent;
            // PHP: str_replace(".", "", $author->shortname)
            const cleanName = shortname.replace(/\./g, '');
            //const tokens = clean\.split(" ");
            const tokens = cleanName.split(" "); // CGQ
            // PHP: $tokens[1] . " " . $tokens[0]
            return prefix + (tokens[1] || "") + " " + (tokens[0] || "");
        }

        // Prepare Author data for global lookup (to handle links and name replacements)
        const authors = Array.from(xml.querySelectorAll('author'));
        const authorsWithWebsite = authors.filter(a => a.querySelector('website')?.textContent);
        const authorsWithShortname = authors.filter(a => a.querySelector('shortname')?.textContent);

        // --- 4. Main Rendering Loop ---
        let htmlOutput = "";
        const sections = xml.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTitle = section.querySelector('title').textContent;
            htmlOutput += `<h3>${sectionTitle}</h3>`;

            const papers = Array.from(section.querySelectorAll('paper'));
            let counter = papers.length;
            htmlOutput += open_list;

            papers.forEach(paper => {
                htmlOutput += `<li class="paper" value="${counter}">`;
                counter--;

                let ref = paper.querySelector('reference').textContent;

                // A. Title formatting (Italicize middle part of 3-part reference)
                const refParts = ref.split(". ");
                if (refParts.length === 3) {
                    ref = `${refParts[0]}. <i>${refParts[1]}.</i> ${refParts[2]}`;
                }

                // B. Add Hyperlinks for authors
                if (display_author_links) {
                    authorsWithWebsite.forEach(auth => {
                        const name = auth.querySelector('name').textContent;
                        const site = auth.querySelector('website').textContent;
                        // Use split/join to avoid regex special character issues in names
                        ref = ref.split(name).join(`<a href="${site}">${name}</a>`);
                    });
                }

                // C. Short names or NSERC names
                if (short_names) {
                    authorsWithShortname.forEach(auth => {
                        const name = auth.querySelector('name').textContent;
                        const short = auth.querySelector('shortname').textContent;
                        ref = ref.split(name).join(short);
                    });
                } else if (nserc_mode) {
                    authorsWithShortname.forEach(auth => {
                        const name = auth.querySelector('name').textContent;
                        const nsercName = convertToNsercName(auth);
                        // PHP logic: replace name, then clean up " and " and ", and "
                        let tempRef = ref.split(name).join(nsercName);
                        tempRef = tempRef.replace(", and ", ", ").replace(" and ", ", ");
                        ref = tempRef;
                    });
                }

                htmlOutput += ref;

                // D. Acceptance Rate
                const accRate = paper.querySelector('acceptancerate');
                if (display_acceptance_rates && accRate && accRate.textContent) {
                    htmlOutput += ` Acceptance rate: ${accRate.textContent}&nbsp;%.`;
                }

                // E. Awards
                const award = paper.querySelector('award');
                if (display_awards && award && award.textContent) {
                    htmlOutput += `<br><b>${award.textContent}</b>`;
                }

                // F. Related Files
                if (display_files) {
                    const files = Array.from(paper.querySelectorAll('file'));
                    const validFiles = files.filter(f => {
                        const pubDate = f.querySelector('publish_date')?.textContent;
                        return !pubDate || pubDate <= today_string;
                    });

                    if (validFiles.length > 0) {
                        const links = validFiles.map(f => {
                            const label = f.querySelector('label').textContent;
                            const path = f.querySelector('path').textContent;
                            return getFileLink(label, path);
                        }).join(" | ");
                        htmlOutput += `<br>[ ${links} ]`;
                    }
                }

                htmlOutput += "</li>";
            });

            htmlOutput += close_list;
        });

        container = document.getElementById("main");
	container.innerHTML = htmlOutput;
    } catch (error) {
        console.error("Error loading publications:", error);
        container.innerHTML = "Error loading publications.";
    }
}

// Helper to treat a number/string as YYYYMMDD format
function asString(val) { return String(val); }

// Initialize
//window.onload = loadPublications;
