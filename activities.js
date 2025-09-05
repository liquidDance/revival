// Datos de actividades (extraídos del CSV)
const allActivities = [
    {
        id: "0100",
        date: "06/08/25",
        day: 1,
        activity: "Arrive to the accomondations",
        activity_es: "Llegada al alojamiento",
        place: "",
        lat: null,
        lng: null,
        participants: []
    },
    {
        id: "0101",
        date: "06/08/25",
        day: 1,
        activity: "Opening Circle",
        activity_es: "Círculo de apertura",
        place: "Bosque Cala Pada",
        lat: 38.99322,
        lng: 1.56329,
        participants: []
    },
    {
        id: "0102",
        date: "06/08/25",
        day: 1,
        activity: "Journey into the flow",
        activity_es: "Viaje hacia la fluidez",
        place: "Cala Pada",
        lat: 38.99327,
        lng: 1.56183,
        participants: ["Martin", "Tanja"]
    },
    {
        id: "0201",
        date: "07/08/25",
        day: 2,
        activity: "Awaken Flow - Yoga & playful connection",
        activity_es: "Despertar del flujo - Yoga y conexión lúdica",
        place: "Playa S'Arenal Petit, Portinatx",
        lat: 39.10877,
        lng: 1.51521,
        participants: ["Zara"]
    },
    {
        id: "0202",
        date: "07/08/25",
        day: 2,
        activity: "Water-Rebozo",
        activity_es: "Rebozo de agua",
        place: "",
        lat: null,
        lng: null,
        participants: ["Anuja"]
    },
    {
        id: "0206",
        date: "07/08/25",
        day: 2,
        activity: "Introduction Soma-Water Dance in Pool",
        activity_es: "Introducción a la danza Soma-Agua en la piscina",
        place: "Willem",
        lat: 39.00181,
        lng: 1.54227,
        participants: ["Martin"]
    },
    {
        id: "0207",
        date: "07/08/25",
        day: 2,
        activity: "Ecstatic Dance",
        activity_es: "Danza extática",
        place: "",
        lat: null,
        lng: null,
        participants: ["Willem"]
    },
    {
        id: "0301",
        date: "08/08/25",
        day: 3,
        activity: "Morning Practice",
        activity_es: "Práctica matutina",
        place: "Cala Benirràs",
        lat: 39.08958,
        lng: 1.45463,
        participants: ["Anuja"]
    },
    {
        id: "0304",
        date: "08/08/25",
        day: 3,
        activity: "Deep Dance Swarm among the sea weed",
        activity_es: "Danza profunda Enjambre entre las algas",
        place: "",
        lat: null,
        lng: null,
        participants: ["Alex"]
    },
    {
        id: "0401",
        date: "09/08/25",
        day: 4,
        activity: "Morning Practice - Soma & Voice",
        activity_es: "Práctica matutina - Soma y voz",
        place: "ses Salines",
        lat: 38.83970,
        lng: 1.39704,
        participants: ["Riki"]
    },
    {
        id: "0402",
        date: "09/08/25",
        day: 4,
        activity: "Partner-Water-Dance",
        activity_es: "Danza en pareja en el agua",
        place: "Cala Pluma",
        lat: 38.83574,
        lng: 1.40067,
        participants: ["Alex"]
    },
    {
        id: "0404",
        date: "09/08/25",
        day: 4,
        activity: "Contact Improv and Water Rebozo",
        activity_es: "Contact Improvisación y Rebozo de agua",
        place: "",
        lat: null,
        lng: null,
        participants: ["Anuja"]
    },
    {
        id: "0405",
        date: "09/08/25",
        day: 4,
        activity: "Water Blessing Ceremony & Sunset Jam",
        activity_es: "Ceremonia de bendición del agua y jam al atardecer",
        place: "",
        lat: null,
        lng: null,
        participants: ["Nati"]
    },
    {
        id: "0501",
        date: "10/08/25",
        day: 5,
        activity: "Moving, Sharing, Caring, Dancing, Flowing & Closing",
        activity_es: "Moviéndose, compartiendo, cuidando, bailando, fluyendo y cerrando",
        place: "sa Caleta",
        lat: 38.87005,
        lng: 1.33973,
        participants: []
    }
];

// Filtrar solo actividades con ubicación
const activitiesWithLocation = allActivities.filter(activity => activity.lat && activity.lng);