import { Body, Equator, Ecliptic, GeoVector, MakeTime } from 'astronomy-engine';

export interface AstrologicalData {
    moonPhase: number; // 0-1, where 0 is New Moon, 0.5 is Full Moon
    moonSign: string;
    sunSign: string;
    currentDasha?: string; // Simplified for this implementation
    nakshatra: string;
    impactOnHealth: {
        sleep: string;
        energy: string;
        stress: string;
    }
}

const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const nakshatrasList = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

export function getAstrologicalContext(date: Date = new Date()): AstrologicalData {
    const time = MakeTime(date);

    // Moon Position
    const moonEq = Equator(Body.Moon, time, { latitude: 0, longitude: 0, height: 0 }, true, true);
    // Rough estimation for ecliptic longitude
    // (Note: For precise Vedic Astrology, we would use Lahiri Ayanamsha for sidereal longitude.
    // Astronomy Engine gives tropical by default. We will approximate or use tropical for demonstration if ayanamsha is complex,
    // but the task asks for Vedic correlations, so we can mock a rough offset (~24 degrees) for sidereal).
    const AYANAMSHA_OFFSET = 24.1;

    const eclipticMoon = Ecliptic(GeoVector(Body.Moon, time, true));
    let siderealMoonLon = (eclipticMoon.elon - AYANAMSHA_OFFSET + 360) % 360;

    const eclipticSun = Ecliptic(GeoVector(Body.Sun, time, true));
    let siderealSunLon = (eclipticSun.elon - AYANAMSHA_OFFSET + 360) % 360;

    // Calculate Moon Phase (Angle between Moon and Sun)
    let phaseAngle = (eclipticMoon.elon - eclipticSun.elon + 360) % 360;
    let moonPhase = phaseAngle / 360.0;

    // Zodiac Sign (Tropical or Sidereal - we use sidereal for Vedic)
    const moonSignIndex = Math.floor(siderealMoonLon / 30);
    const sunSignIndex = Math.floor(siderealSunLon / 30);

    // Nakshatra (13 degrees 20 minutes each, so 360 / 27 = 13.333)
    const nakshatraIndex = Math.floor(siderealMoonLon / (360 / 27));

    // Determine impact based on moon phase
    let healthImpact = {
        sleep: "Normal",
        energy: "Estável",
        stress: "Moderado"
    };

    if (moonPhase > 0.45 && moonPhase < 0.55) {
        // Full Moon
        healthImpact = {
            sleep: "Possível dificuldade em iniciar o sono. Melatonina pode ser suprimida.",
            energy: "Pico de energia, ótimo para treinos intensos (Pitta elevado).",
            stress: "Emoções à flor da pele. Recomendada meditação de aterramento."
        };
    } else if (moonPhase < 0.05 || moonPhase > 0.95) {
        // New Moon
        healthImpact = {
            sleep: "Sono profundo provável. Corpo focado em regeneração.",
            energy: "Energia mais baixa (Vata elevado). Focar em recuperação.",
            stress: "Bom momento para introspecção e planejamento."
        };
    }

    return {
        moonPhase,
        moonSign: zodiacSigns[moonSignIndex],
        sunSign: zodiacSigns[sunSignIndex],
        nakshatra: nakshatrasList[nakshatraIndex],
        impactOnHealth: healthImpact
    };
}
