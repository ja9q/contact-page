const map = L.map('map').setView([41, -74], 13); 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);

markers = [];

const loadPlaces = async () => {
    const response = await axios.get('/places');
    const tbody = document.querySelector('tbody');

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    if (response && response.data && response.data.contacts) {
        for (var i = 0; i < markers.length; i++) {
            map.removeLayer(markers[i]);
        }

        for (const contact of response.data.contacts) {
            
            // form the tr that displays in medium or larger screens
            const tr1 = document.createElement('tr');
            const tr2 = document.createElement('tr');
            tr1.setAttribute("class", "d-none d-md-table-row");
            tr2.setAttribute("class", "d-table-row d-md-none");

            if (!(contact.lat === 0 && contact.lng === 0) && !(contact.lat === undefined && contact.lng === undefined)) {
                marker = L.marker([contact.lat, contact.lng]).addTo(map).bindPopup(
                        `<b>${contact.namePrefix} ${contact.firstName} ${contact.lastName}</b><br/>
                        <section>${contact.street},</section>
                        <section>${contact.city} ${contact.state} ${contact.zip}</section>
                        <section>${contact.country}</section>`);
                markers.push(marker);
                tr1.onclick = on_row_click;
                tr2.onclick = on_row_click;
            } else {
                tr1.onclick = showErrorPopup;
                tr2.onclick = showErrorPopup;
            }

            tr1.dataset.lat = contact.lat;
            tr1.dataset.lng = contact.lng;
            tr2.dataset.lat = contact.lat;
            tr2.dataset.lng = contact.lng;
            tr1.dataset.label = 
                `<b>${contact.namePrefix} ${contact.firstName} ${contact.lastName}</b>
                <br/><section>${contact.street},</section>
                <section>${contact.city} ${contact.state} ${contact.zip}</section>
                <section>${contact.country}</section>`;
            tr2.dataset.label = 
                `<b>${contact.namePrefix} ${contact.firstName} ${contact.lastName}</b>
                <br/><section>${contact.street},</section>
                <section>${contact.city} ${contact.state} ${contact.zip}</section>
                <section>${contact.country}</section>`;

            tr1.innerHTML = `
                <td>${contact.namePrefix} ${contact.firstName} ${contact.lastName}</td>
                <td>${contact.phoneNumber}</td>
                <td>${contact.emailAddress}</td>
                <td>
                    <section>${contact.street},</section>
                    <section>${contact.city} ${contact.state} ${contact.zip}</section>
                    <section>${contact.country}</section>
                </td>
            `;
            if (!(contact.lat === 0 && contact.lng === 0) && !(contact.lat === undefined && contact.lng === undefined)) {
                tr1.innerHTML += `
                <td>
                    <section> ${contact.lat}&#176; N,</section>
                    <section> ${contact.lng}&#176; W </section>
                </td>
                `;
            } else {
                tr1.innerHTML += `
                <td>
                    <p>No coordinates found.</p>
                </td>
                `;
            }
            tr1.innerHTML += `
                <td>
                <section>
                    <input id="phone${contact.id}" type="checkbox" ${(contact.contactByPhone==1) ? "checked" : ""} disabled />
                    <label for="phone${contact.id}">Phone</label>
                </section>
                <section>
                    <input id="email${contact.id}" type="checkbox" ${(contact.contactByEmail==1) ? "checked" : ""} disabled />
                    <label for="email${contact.id}">Email</label>
                </section>
                <section>
                    <input id="mail${contact.id}" type="checkbox" ${(contact.contactByMail==1) ? "checked" : ""} disabled />
                    <label for="mail${contact.id}">Mail</label>
                </section>
                </td>
            `;
            if (response.data.user) {
                tr1.innerHTML += `
                    <td>
                    <p>    
                        <a class="btn btn-outline-secondary btn-sm" href="/${contact.id}/edit">Edit</a>
                    </p>
                    <section>
                        <a class="btn btn-danger btn-sm" href="/${contact.id}/delete">Delete</a>
                    </section>
                    </td>
                `;
            }

            tr2.innerHTML = `
                    <li class="list-group-item border-0">${contact.namePrefix} ${contact.firstName} ${contact.lastName}</li>
                    <li class="list-group-item border-0">${contact.phoneNumber}</li>
                    <li class="list-group-item border-0">${contact.emailAddress}</li>
                    <li class="list-group-item border-0">
                        <section>${contact.street},</section>
                        <section>${contact.city} ${contact.state} ${contact.zip}</section>
                        <section>${contact.country}</section>
                    </li>
            `;
            if (!(contact.lat === 0 && contact.lng === 0) && !(contact.lat === undefined && contact.lng === undefined)) {
                tr2.innerHTML += `
                <li class="list-group-item border-0">
                    ${contact.lat}&#176; N, ${contact.lng}&#176; W
                </li>
                `;
            } else {
                tr2.innerHTML += `
                <li class="list-group-item border-0">
                    <p>No coordinates found.</p>
                </li>
                `;
            }
            tr2.innerHTML += `
                <li class="list-group-item border-0">
                <section>
                    <input id="phone${contact.id}" type="checkbox" ${(contact.contactByPhone==1) ? "checked" : ""} disabled />
                    <label for="phone${contact.id}">Phone</label>
                </section>
                <section>
                    <input id="email${contact.id}" type="checkbox" ${(contact.contactByEmail==1) ? "checked" : ""} disabled />
                    <label for="email${contact.id}">Email</label>
                </section>
                <section>
                    <input id="mail${contact.id}" type="checkbox" ${(contact.contactByMail==1) ? "checked" : ""} disabled />
                    <label for="mail${contact.id}">Mail</label>
                </section>
                </li>
            `;

            if (response.data.user) {
                tr2.innerHTML += `
                <li class="list-group-item border-0">
                    <div class="btn-group">
                        <a class="btn btn-outline-secondary" href="/${contact.id}/edit">Edit</a>
                        <a class="btn btn-danger" href="/${contact.id}/delete">Delete</a>
                    </div>
                </li>
                `;
            }

            tr2.innerHTML = `<ul class="list-group d-md-none"> ${tr2.innerHTML} </ul>`;

            tbody.appendChild(tr1);
            tbody.appendChild(tr2);
        }
    }
}

const on_row_click = (e) => {
    let row = e.target;
    while (row.tagName.toUpperCase() !== 'TR') {
        row = row.parentNode;
    }

    const lat = row.dataset.lat;
    const lng = row.dataset.lng;

    const coords = new L.LatLng(lat, lng);

    map.flyTo(coords);

    for (var i = 0; i < markers.length; i++) {
        if(markers[i].getLatLng().equals(coords)) {
            markers[i].openPopup();
        }
    }
}

const showErrorPopup = (e) => {
    map.stop();
    console.log("error");
    var popup = L.popup(map.getCenter(), {direction: 'center', content: 'This contact could not be geolocated'})
    .openOn(map);
}