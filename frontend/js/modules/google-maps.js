// Em: frontend/js/modules/google-maps.js

// Cache para a API key
let googleMapsApiKey = null;
let apiLoading = false; // Flag para evitar múltiplas requisições simultâneas
let apiLoadPromise = null; // Armazenar a Promise de carregamento

/**
 * Carrega a API do Google Maps com a chave apropriada
 * @returns {Promise} Promise que resolve quando a API é carregada
 */
export async function loadGoogleMapsAPI() {
  // Verifica se a API já foi carregada
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  // Se já estiver carregando, retorna a Promise em andamento
  if (apiLoading && apiLoadPromise) {
    return apiLoadPromise;
  }

  // Marca como em processo de carregamento
  apiLoading = true;

  // Criar uma nova Promise para o carregamento
  apiLoadPromise = new Promise(async (resolve, reject) => {
    try {
      // Busca a API key do servidor, se ainda não tiver sido buscada
      if (!googleMapsApiKey) {
        console.log('Buscando API key do Google Maps...');
        try {
          const response = await fetch('/api/config/maps');
          if (!response.ok) throw new Error('Não foi possível obter a chave da API do Maps');
          const data = await response.json();
          googleMapsApiKey = data.apiKey;
          console.log('API key do Google Maps obtida com sucesso');
        } catch (error) {
          console.error('Erro ao buscar a chave da API do Maps:', error);
          apiLoading = false;
          reject(error);
          return;
        }
      }

      // Verificar novamente se enquanto buscávamos a chave alguém já carregou a API
      if (window.google && window.google.maps) {
        apiLoading = false;
        resolve();
        return;
      }

      // Define uma função de callback global para quando a API carregar
      window.initGoogleMapsCallback = () => {
        console.log('Google Maps API carregada com sucesso');
        apiLoading = false;
        resolve();
        // Limpa a função global após uso
        delete window.initGoogleMapsCallback;
      };

      // Cria e adiciona o script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initGoogleMapsCallback`;
      script.async = true;
      script.defer = true;

      script.onerror = (err) => {
        console.error('Falha ao carregar a API do Google Maps:', err);
        apiLoading = false;
        // Limpa a função global em caso de erro
        delete window.initGoogleMapsCallback;
        reject(new Error('Falha ao carregar a API do Google Maps'));
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Erro geral ao carregar a API do Google Maps:', error);
      apiLoading = false;
      reject(error);
    }
  });

  return apiLoadPromise;
}

/**
 * Inicializa um mapa no elemento fornecido
 * @param {HTMLElement} element - Elemento onde o mapa será criado
 * @param {Object} options - Opções para o mapa
 * @returns {Promise<{map: google.maps.Map, marker: google.maps.Marker, autocomplete: google.maps.places.Autocomplete}>}
 */
export async function initializeMap(element, options = {}) {
  if (!element) {
    console.error('Elemento para o mapa não encontrado');
    throw new Error('Elemento para o mapa não encontrado');
  }

  try {
    // Carrega a API
    await loadGoogleMapsAPI();

    // Opções padrão
    const defaultOptions = {
      center: { lat: -15.77972, lng: -47.92972 }, // Centro do Brasil
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
      // styles: [
      //   // Estilos para mapa escuro, compatível com seu tema
      //   { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      //   { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      //   { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      //   // ...mais estilos podem ser adicionados aqui
      // ]
    };

    // Mescla as opções padrão com as fornecidas
    const mapOptions = { ...defaultOptions, ...options };

    // Cria o mapa
    const map = new google.maps.Map(element, mapOptions);

    // Cria um marcador
    const marker = new google.maps.Marker({
      position: mapOptions.center,
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP
    });

    return { map, marker };
  } catch (error) {
    console.error('Erro ao inicializar mapa:', error);
    if (element) {
      element.innerHTML = '<div class="map-error">Não foi possível carregar o mapa. Verifique sua conexão.</div>';
    }
    throw error;
  }
}

/**
 * Inicializa o autocomplete em um campo de input
 * @param {HTMLInputElement} input - Elemento de input para o autocomplete
 * @param {google.maps.Map} map - Instância do mapa (opcional)
 * @param {google.maps.Marker} marker - Instância do marcador (opcional)
 * @returns {google.maps.places.Autocomplete} A instância do autocomplete
 */
export function initializeAutocomplete(input, map = null, marker = null) {
  if (!input) {
    console.error('Input para autocomplete não encontrado');
    throw new Error('Input para autocomplete não encontrado');
  }

  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.error('API do Google Maps Places não carregada');
    throw new Error('API do Google Maps Places não carregada');
  }

  try {
    // Cria o autocomplete
    const autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ["formatted_address", "geometry", "name"],
      types: ["establishment", "geocode"]
    });

    // Se temos um mapa e um marcador, configuramos para atualizar quando um lugar for selecionado
    if (map && marker) {
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          console.error("Lugar selecionado não tem geometria");
          return;
        }

        // Atualiza o mapa e o marcador
        map.setCenter(place.geometry.location);
        marker.setPosition(place.geometry.location);

        // Dispara um evento para notificar da mudança
        const updateEvent = new CustomEvent('location-updated', {
          detail: {
            place,
            coords: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            },
            address: place.formatted_address
          }
        });
        input.dispatchEvent(updateEvent);
      });
    }

    return autocomplete;
  } catch (error) {
    console.error('Erro ao inicializar autocomplete:', error);
    throw error;
  }
}

/**
 * Geocodifica um endereço para coordenadas
 * @param {string} address - Endereço a ser geocodificado
 * @returns {Promise<Object>} Coordenadas {lat, lng} e endereço formatado
 */
export async function geocodeAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new Error('Endereço inválido');
  }

  await loadGoogleMapsAPI();

  return new Promise((resolve, reject) => {
    try {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            coords: {
              lat: location.lat(),
              lng: location.lng()
            },
            formattedAddress: results[0].formatted_address
          });
        } else {
          console.error(`Geocodificação falhou: ${status}`);
          reject(new Error(`Geocodificação falhou: ${status}`));
        }
      });
    } catch (error) {
      console.error('Erro ao executar geocodeAddress:', error);
      reject(error);
    }
  });
}

/**
 * Geocodificação reversa (coordenadas para endereço)
 * @param {Object} coords - Coordenadas {lat, lng}
 * @returns {Promise<string>} Endereço formatado
 */
export async function reverseGeocode(coords) {
  if (!coords || typeof coords !== 'object' || (coords.lat === undefined || coords.lng === undefined)) {
    throw new Error('Coordenadas inválidas');
  }

  await loadGoogleMapsAPI();

  return new Promise((resolve, reject) => {
    try {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ location: coords }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          console.error(`Geocodificação reversa falhou: ${status}`);
          reject(new Error(`Geocodificação reversa falhou: ${status}`));
        }
      });
    } catch (error) {
      console.error('Erro ao executar reverseGeocode:', error);
      reject(error);
    }
  });
}

/**
 * Formata coordenadas para o formato esperado pelo backend "(lat,lng)"
 * @param {Object|google.maps.LatLng} coords - Coordenadas {lat, lng} ou objeto LatLng
 * @returns {string} Coordenadas formatadas
 */
export function formatCoordinates(coords) {
  if (!coords) {
    console.error('Coordenadas não fornecidas para formatCoordinates');
    return '(0,0)'; // Valor padrão se não houver coordenadas
  }

  let lat, lng;

  try {
    if (coords instanceof google.maps.LatLng) {
      lat = coords.lat();
      lng = coords.lng();
    } else {
      lat = coords.lat;
      lng = coords.lng;
    }

    // Verifica se lat e lng são válidos
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Coordenadas inválidas:', coords);
      return '(0,0)';
    }

    return `(${lat},${lng})`;
  } catch (error) {
    console.error('Erro ao formatar coordenadas:', error, coords);
    return '(0,0)';
  }
}