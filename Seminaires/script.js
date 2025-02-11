function init() {
    let today = "20250210";
    let today_date = new Date();	// TODO: Convertir en YYYYMMDD

    // const xml = fs.readFileSync("https://cquimper.github.io/Seminaires/seminaires.xml", "utf8");
    
    let s = "";

    var myHeaders = new Headers();
    myHeaders.append('Content-Type','text/plain; charset=UTF-8'); // Utile?
    //const source = "https://cquimper.github.io/Seminaires/seminaires.xml";
    const source = "seminaires.xml";
    fetch(source, myHeaders).then((response) => response.text()).then((xmlString) => {
	console.log(xmlString);
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlString, "text/xml");

	const seminars = xmlDoc.querySelectorAll("seminar");
	seminars.forEach((seminar) => {
	    s += get_seminar_html(seminar);
	});
	document.getElementById("venir").innerHTML = s;
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

    let s = `<h3>${WEEK_DAYS[week_day]} ${day} ${MONTHS[month]} ${year}</h3>`;
    s += `<p style=\"text-align:left;\"><b>${title}</b>`;
    if (websiteNode)
	s += `<a href=\"${websiteNode.textContent}\">`;
    s += `<br>${speaker}</br>`;
    if (websiteNode)
	s += "</a>";
    if (jobNode)
	s += `<br><i>${jobNode.textContent}</i>`;
    s += "<p>";
    if (time != "")
	s += `<b>Heure</b>: ${time}<br>`;
    if (room.startsWith("http")) {
	s += `<b>Visioconférence</b>: <a href=\"${room}\">Zoom</a>`;
    } else if (room != "") {
	s += `<b>Local</b>: ${room}`;
    }
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

    if (abstractNode) {
	s += `<p><b>Résumé: </b><resume>${abstract}</resume></p>`;
    }

    if (bioNode) {
	s += `<p><b>Biographie: </b>${bioNode.textContent}</p>`;
    }

    if (noteNode) {
	s += `<p><b>Note: </b>${noteNode.textContent}</p>`;
    }

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

