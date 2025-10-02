interface Cancion { titulo: string; nombre: string; fuente: string; }

class Nodo { 
    public anterior: Nodo | null = null; 
    public siguiente: Nodo | null = null; 
    constructor(public cancion: Cancion) {} 
}

class ListaDoble {
    public cabeza: Nodo | null = null;
    public cola: Nodo | null = null;
    agregarFinal(c: Cancion) {
        const n = new Nodo(c);
        if (!this.cabeza) this.cabeza = this.cola = n;
        else { this.cola!.siguiente = n; n.anterior = this.cola; this.cola = n; }
    }
    agregarInicio(c: Cancion) {
        const n = new Nodo(c);
        if (!this.cabeza) this.cabeza = this.cola = n;
        else { n.siguiente = this.cabeza; this.cabeza.anterior = n; this.cabeza = n; }
    }
    eliminar(nodo: Nodo) {
        if (nodo.anterior) nodo.anterior.siguiente = nodo.siguiente;
        else this.cabeza = nodo.siguiente;
        if (nodo.siguiente) nodo.siguiente.anterior = nodo.anterior;
        else this.cola = nodo.anterior;
    }
}

const listaCanciones = new ListaDoble();
const cancionesIniciales: Cancion[] = [
    { titulo: "In The End", nombre: "Linkin Park", fuente: "music/test1.mp3" },
{ titulo: "Mind Games", nombre: "Sickick", fuente: "music/test2.mp3" },
{ titulo: "Monster", nombre: "Skillet", fuente: "music/test3.mp3" },
{ titulo: "One of the Girls", nombre: "The Weeknd", fuente: "music/test4.mp3" }
];
cancionesIniciales.forEach(c => listaCanciones.agregarFinal(c));
let nodoActual: Nodo | null = listaCanciones.cabeza;

const tituloCancion = document.getElementById('tituloCancion') as HTMLHeadingElement;
const nombreArtista = document.getElementById('nombreArtista') as HTMLParagraphElement;
const progreso = document.getElementById('progreso') as HTMLInputElement;
const cancion = document.getElementById('cancion') as HTMLAudioElement;
const iconoControl = document.getElementById('iconoControl') as HTMLElement;

const botonReproducirPausar = document.getElementById('botonReproducirPausar') as HTMLButtonElement;
const botonAtras = document.getElementById('botonAtras') as HTMLButtonElement;
const botonAdelante = document.getElementById('botonAdelante') as HTMLButtonElement;

const botonAgregar = document.getElementById('botonAgregar') as HTMLButtonElement;
const botonEliminar = document.getElementById('botonEliminar') as HTMLButtonElement;

// Audius search UI elements
const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
const searchButton = document.getElementById('searchButton') as HTMLButtonElement | null;
const searchResults = document.getElementById('searchResults') as HTMLDivElement | null;

// Audius API helpers
let AUDIUS_HOST = 'https://discoveryprovider.audius.co';
const APP_NAME = 'mi-reproductor-ejemplo';

async function discoverHost() {
    try {
        const r = await fetch('https://api.audius.co');
        const j = await r.json();
        if (j.data && j.data.length) AUDIUS_HOST = j.data[0];
    } catch (e) {
        // keep default if discovery fails
        console.warn('No se pudo descubrir host Audius, usando default', e);
    }
}

async function searchTracks(query: string) {
    if (!query) return [];
    const url = `${AUDIUS_HOST}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${APP_NAME}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error en búsqueda Audius');
    const j = await res.json();
    return j.data || [];
}

function renderSearchResults(tracks: any[]) {
    if (!searchResults) return;
    searchResults.innerHTML = '';
    if (!tracks.length) { searchResults.textContent = 'No se encontraron resultados'; return; }
    tracks.forEach(t => {
        const row = document.createElement('div');
        row.className = 'resultado';
        const title = document.createElement('div');
        title.textContent = `${t.title} — ${t.user?.name || t.user?.handle || ''}`;
        const btnAdd = document.createElement('button');
        btnAdd.textContent = 'Agregar';
        btnAdd.addEventListener('click', ()=>{
            // use stream endpoint as source
            const src = `${AUDIUS_HOST}/v1/tracks/${t.id}/stream?app_name=${APP_NAME}`;
            listaCanciones.agregarFinal({titulo:t.title,nombre:t.user?.name||t.user?.handle||'Unknown',fuente:src});
            if(!nodoActual) nodoActual = listaCanciones.cabeza;
            actualizarInfoCancion();
        });
        const btnPlay = document.createElement('button');
        btnPlay.textContent = 'Reproducir';
        btnPlay.addEventListener('click', async ()=>{
            const src = `${AUDIUS_HOST}/v1/tracks/${t.id}/stream?app_name=${APP_NAME}`;
            // play directly without adding to playlist
            cancion.src = src;
            cancion.load();
            try { await cancion.play(); iconoControl.classList.replace('bi-play-fill','bi-pause-fill'); } catch(e){ console.warn('Autoplay bloqueado', e); }
        });
        row.appendChild(title);
        row.appendChild(btnAdd);
        row.appendChild(btnPlay);
        searchResults.appendChild(row);
    });
}

if (searchButton && searchInput) {
    searchButton.addEventListener('click', async ()=>{
        const q = searchInput.value.trim();
        if(!q) return;
        searchButton.disabled = true;
        try {
            await discoverHost();
            const results = await searchTracks(q);
            renderSearchResults(results);
        } catch (e) {
            if (searchResults) searchResults.textContent = 'Error buscando en Audius';
            console.error(e);
        }
        searchButton.disabled = false;
    });
}

const inputTitulo = document.getElementById('tituloNuevo') as HTMLInputElement;
const inputArtista = document.getElementById('artistaNuevo') as HTMLInputElement;
const inputFuente = document.getElementById('fuenteNueva') as HTMLInputElement;
const selectPosicion = document.getElementById('posicionNueva') as HTMLSelectElement;

function actualizarInfoCancion() {
    if (!nodoActual) { 
        tituloCancion.textContent = "No hay canciones"; 
        nombreArtista.textContent = ""; 
        cancion.src = ""; 
        return; 
    }
    tituloCancion.textContent = nodoActual.cancion.titulo;
    nombreArtista.textContent = nodoActual.cancion.nombre;
    cancion.src = nodoActual.cancion.fuente;
    cancion.load(); 
}

function reproducirCancion() { 
    cancion.play(); 
    iconoControl.classList.replace('bi-play-fill','bi-pause-fill'); 
}
function pausarCancion() { 
    cancion.pause(); 
    iconoControl.classList.replace('bi-pause-fill','bi-play-fill'); 
}
function reproducirPausar() { 
    if(cancion.paused) reproducirCancion(); 
    else pausarCancion(); 
}

cancion.addEventListener('loadedmetadata', ()=>progreso.max = cancion.duration.toString());
cancion.addEventListener('timeupdate', ()=>progreso.value = cancion.currentTime.toString());
progreso.addEventListener('input', ()=>cancion.currentTime = Number(progreso.value));

botonReproducirPausar.addEventListener('click', reproducirPausar);
botonAdelante.addEventListener('click', ()=>{
    nodoActual = nodoActual?.siguiente || listaCanciones.cabeza; 
    actualizarInfoCancion(); 
    reproducirCancion(); 
});
botonAtras.addEventListener('click', ()=>{
    nodoActual = nodoActual?.anterior || listaCanciones.cola; 
    actualizarInfoCancion(); 
    reproducirCancion(); 
});

function agregarCancionDOM() {
    const t = inputTitulo.value.trim(), a = inputArtista.value.trim(), f = inputFuente.value.trim(), p = selectPosicion.value as 'inicio'|'final';
    if(!t || !a || !f) return;
    if(p==='inicio') listaCanciones.agregarInicio({titulo:t,nombre:a,fuente:f});
    else listaCanciones.agregarFinal({titulo:t,nombre:a,fuente:f});
    inputTitulo.value=''; inputArtista.value=''; inputFuente.value='';
    if(!nodoActual) nodoActual=listaCanciones.cabeza;
    actualizarInfoCancion();
}

function eliminarCancionDOM() {
    if(!nodoActual) return;
    const nodoAEliminar = nodoActual;
    nodoActual = nodoActual.siguiente || nodoActual.anterior;
    listaCanciones.eliminar(nodoAEliminar);
    actualizarInfoCancion();
}

botonAgregar.addEventListener('click', agregarCancionDOM);
botonEliminar.addEventListener('click', eliminarCancionDOM);

actualizarInfoCancion();
