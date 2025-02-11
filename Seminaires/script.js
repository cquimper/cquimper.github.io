function init() {
    const today = new Date();
    const today_number = (today.getFullYear() * 100 + (today.getMonth() + 1)) * 100 + today.getDate();

    let s = "";
    const source = "https://cquimper.github.io/Seminaires/seminaires.xml";
    fetch(source).then((response) => response.text()).then((xmlString) => {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlString, "text/xml");

	const SECTION_TITLES = ["SÉMINAIRE AUJOURD'HUI", "Séminaires à venir", "Séminaires passés"];
	const QUERY_OPERATOR = ["=", ">", "<"];
	const REVERSE = [false, false, true];

	for (let section = 0; section < 3; section++) {
	    const seminaires_results = xmlDoc.evaluate(
		`/seminars/seminar[(number(year) * 100 + number(month)) * 100 + number(day) ${QUERY_OPERATOR[section]} ${today_number}]`,
		xmlDoc,
		null,
		XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

	    let section_title = `<h2>${SECTION_TITLES[section]}</h2>`;
	    seminar_strings = []
	    for (let current_seminar = seminaires_results.iterateNext();
		 current_seminar;
		 current_seminar = seminaires_results.iterateNext()) {
		if (section_title) {
		    s += section_title;
		    section_title = null;
		}
		seminar_strings.push(get_seminar_html(current_seminar));
	    }
	    if (REVERSE[section])
		seminar_strings.reverse();
	    s += seminar_strings.join("");
	}
	document.getElementById("seminaires").innerHTML = s;
    });
}

function get_seminar_html(seminar) {
    const WEEK_DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    const abstractNode = seminar.querySelector("abstract");
    const speakerNode = seminar.querySelector("speaker");
    const timeNode = seminar.querySelector("time");
    const roomNode = seminar.querySelector("room");
    const websiteNode = seminar.querySelector("website");
    const jobNode = seminar.querySelector("job");
    const zoomNode = seminar.querySelector("zoom");
    const recordingNode = seminar.querySelector("recording");
    const bioNode = seminar.querySelector("bio");
    const noteNode = seminar.querySelector("note");

    const title = seminar.querySelector("title").textContent;
    const abstract = abstractNode ? abstractNode.textContent : "";
    const speaker = speakerNode ? speakerNode.textContent : "";
    const day = Number(seminar.querySelector("day").textContent);
    const month = Number(seminar.querySelector("month").textContent);
    const year = Number(seminar.querySelector("year").textContent);
    const week_day = new Date(year, month, day).getDay();
    const time = timeNode ? timeNode.textContent : "12h00"; // TODO: Read defaults in XML
    const room = roomNode ? roomNode.textContent : "PLT-3775"; // TODO: Read defaults in XML

    let s = `<h3>${WEEK_DAYS[week_day]} ${day} ${MONTHS[month - 1]} ${year}</h3>`;
    s += `<p style=\"text-align:left;\"><b>${title}</b><br>`;
    if (websiteNode)
	s += `<a href=\"${websiteNode.textContent}\">`;
    s += `${speaker}`;
    if (websiteNode)
	s += "</a>";
    if (jobNode)
	s += `<br><i>${jobNode.textContent}</i>`;
    s += "</p><p>";
    if (time != "")
	s += `<b>Heure</b>: ${time}<br>`;
    if (room.startsWith("http"))
	s += `<b>Visioconférence</b>: <a href=\"${room}\">Zoom</a>`;
    else if (room != "")
	s += `<b>Local</b>: ${room}`;
    if (zoomNode)
	s += `<br><b>Visioconférence</b>: <a href=\"${zoomNode.textContent}\">Zoom</a></p>`;
    s += "</p>";

    if (recordingNode) {
	s += `<p><b>Visioconférence: </b><a href=\"${recordingNode.querySelector("link").textContent}\">Enregistrement</a>`;
	passwordNode = recordingNode.querySelector("password");
	if (passwordNode)
	    s += ` (mot de passe: ${passwordNode.textContent})`;
	s += "</p>";
    }

    if (abstractNode)
	s += `<p><b>Résumé: </b><resume>${abstract}</resume></p>`;
    if (bioNode)
	s += `<p><b>Biographie: </b>${bioNode.textContent}</p>`;
    if (noteNode)
	s += `<p><b>Note: </b>${noteNode.textContent}</p>`;

    let file_links = [];
    seminar.querySelectorAll("file").forEach((file) => {
	let link = file.querySelector("path").textContent;
	const label = file.querySelector("label").textContent;
	if (!link.startsWith("http"))
	    link = "files/" + link;
	file_links.push(`<a href=\"${link}\">${label}</a>`);
    });

    if (file_links.length > 0) {
	const link_text = (file_links.length == 1) ? "Lien" : "Liens";
	s += `<p><b>${link_text}</b>: ${file_links.join(", ")}</p>`;
    }
    
    return s + "</div>";
}
