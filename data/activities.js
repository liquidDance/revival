// Mapeo de códigos de actividad a nombres legibles
const activityNames = {
    "Opening_Circle": {
        en: "Opening Circle",
        es: "Círculo de apertura"
    },
    "Journey_into_the_flow": {
        en: "Journey into the flow", 
        es: "Viaje hacia la fluidez"
    },
    "Awaken_Flow_Yoga_playful_connection": {
        en: "Awaken Flow - Yoga & playful connection",
        es: "Despertar del flujo - Yoga y conexión lúdica"
    },
    "Water_Rebozo": {
        en: "Water-Rebozo",
        es: "Rebozo de agua"
    },
    "Introduction_Soma_Water_Dance_Pool": {
        en: "Introduction Soma-Water Dance in Pool",
        es: "Introducción a la danza Soma-Agua en la piscina"
    },
    "Ecstatic_Dance": {
        en: "Ecstatic Dance",
        es: "Danza extática"
    },
    "Morning_Practice": {
        en: "Morning Practice",
        es: "Práctica matutina"
    },
    "Deep_Dance_Swarm_sea_weed": {
        en: "Deep Dance Swarm among the sea weed",
        es: "Danza profunda Enjambre entre las algas"
    },
    "Morning_Practice_Soma_Voice": {
        en: "Morning Practice - Soma & Voice",
        es: "Práctica matutina - Soma y voz"
    },
    "Partner_Water_Dance": {
        en: "Partner-Water-Dance",
        es: "Danza en pareja en el agua"
    },
    "Contact_Improv_Water_Rebozo": {
        en: "Contact Improv and Water Rebozo",
        es: "Contact Improvisación y Rebozo de agua"
    },
    "Water_Blessing_Ceremony_Sunset_Jam": {
        en: "Water Blessing Ceremony & Sunset Jam",
        es: "Ceremonia de bendición del agua y jam al atardecer"
    },
    "Moving_Sharing_Caring_Dancing_Flowing_Closing": {
        en: "Moving, Sharing, Caring, Dancing, Flowing & Closing",
        es: "Moviéndose, compartiendo, cuidando, bailando, fluyendo y cerrando"
    }
};

// Función para obtener nombre traducido de actividad
function getActivityName(activityCode, language = 'es') {
    return activityNames[activityCode]?.[language] || activityCode;
}

// Extraer información limpia de keywords
function parseKeywords(keywords) {
    if (!keywords || keywords.length < 2) return { day: null, activityCode: null };
    
    const day = parseInt(keywords[0]);
    let activityCode = keywords[1].replace(/^\d+\s*/, ''); // Eliminar número inicial
    
    return { day, activityCode };
}