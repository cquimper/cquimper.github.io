function init() {
    const WEEK_DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    let today = "20250210";
    let today_date = new Date();	// TODO: Convertir en YYYYMMDD

    let s = "";
    fetch("https://cquimper.github.io/Seminaires/seminaires.xml").then((response) => response.text()).then((xmlString) => {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlString, "text/xml");

	console.log("Salut!");

	const seminars = xmlDoc.querySelectorAll("seminar");
	seminars.forEach((seminar) => {
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

	    s += "<h3>" + WEEK_DAYS[week_day] + " " + day + " " + MONTHS[month] + " " + year + "</h3>";
	    s += "<p style=\"text-align:left;\"><b>" + title + "</b>";
	    if (websiteNode)
		s += "<a href=\"" + websiteNode.textContent + "\">";
	    s += "<br>" + speaker + "</br>";
	    if (websiteNode)
		s += "</a>";
	    if (jobNode)
		s += "<br><i>" + jobNode.textContent + "</i>";
	    s += "<p>";
	    if (time != "")
		s += "<b>Heure</b>: " + time + "<br>";
	    if (room.startsWith("http")) {
		s += "<b>Visioconférence</b>: <a href=\"" + room + "\">Zoom</a>";
	    } else if (room != "") {
		s += "<b>Local</b>: " + room;
	    }
	    if (zoomNode)
		s += "<br><b>Visioconférence</b>: <a href=\"" + zoomNode.textContent + "\">Zoom</a></p>";
	    s += "</p>";

	    if (recordingNode) {
		s += "<p><b>Visioconférence: </b><a href=\"" + recordingNode.querySelector("link").textContent + "\">Enregistrement</a>";
		passwordNode = recordingNode.querySelector("password");
		if (passwordNode)
		    s += " (mot de passe: " + passwordNode.textContent + ")";
		s += "</p>";
	    }

	    if (abstractNode) {
		s += "<p><b>Résumé: </b><resume>" + abstract + "</resume></p>";
	    }

	    if (bioNode) {
		s += "<p><b>Biographie: </b>" + bioNode.textContent + "</p>";
	    }

	    if (noteNode) {
		s += "<p><b>Note: </b>" + noteNode.textContent + "</p>";
	    }

	    // TODO: Gere les fichiers

	    // s += title;
	    // console.log(title);
	});
	document.getElementById("venir").innerHTML = s;
    });
}

