// Multi-language tooltip content for smart agriculture dashboard
// Expert-level explanations written in farmer-friendly language

export interface TooltipContent {
  title: string;
  content: string;
}

export interface MultiLanguageTooltipContent {
  [key: string]: TooltipContent;
}

export interface TooltipContentByLanguage {
  [key: string]: MultiLanguageTooltipContent;
}

export const SENSOR_TOOLTIPS: TooltipContentByLanguage = {
  en: {
    TEMPERATURE: {
      title: "Air Temperature",
      content: "This measures the temperature of the air around your crops. Temperature affects how fast plants grow, when they flower, and how much water they need. Most crops grow best between 20-30°C (68-86°F). If it's too hot (above 35°C), plants may stop growing or become stressed. If it's too cold (below 15°C), growth slows down significantly."
    },
    
    HUMIDITY: {
      title: "Air Humidity",
      content: "This shows how much moisture is in the air around your crops. Humidity affects disease risk and water loss from plant leaves. Ideal humidity is 50-70% for most crops. High humidity (above 80%) can cause fungal diseases and mold. Low humidity (below 40%) makes plants lose water faster and may cause leaf burn."
    },
    
    SOIL_MOISTURE: {
      title: "Soil Moisture",
      content: "This measures how much water is in the soil around plant roots. The reading shows raw sensor values (ADC) - lower numbers mean more moisture. Most crops need consistent moisture but not waterlogged soil. The ideal range varies by crop: vegetables need more water than grains. Too dry means plants wilt; too wet means roots can rot."
    },
    
    SOIL_TEMPERATURE: {
      title: "Soil Temperature",
      content: "This measures the temperature of the soil where plant roots grow. Soil temperature affects root development, nutrient uptake, and seed germination. Most crops prefer soil temperatures between 18-24°C (64-75°F). Cold soil (below 10°C) slows root growth. Hot soil (above 30°C) can damage roots and reduce water absorption."
    },
    
    LIGHT_INTENSITY: {
      title: "Light Intensity",
      content: "This measures how much light is reaching your crops, shown in 'Lux' units. Plants need light for photosynthesis (making food). Full sunlight is about 50,000-100,000 Lux. Most crops need at least 10,000 Lux for good growth. Too little light means weak, spindly plants. Some crops like lettuce can grow with less light than others like tomatoes."
    },
    
    SOIL_PH: {
      title: "Soil pH (Acidity/Alkalinity)",
      content: "This measures how acidic or alkaline your soil is on a scale from 0-14. A pH of 7 is neutral. Below 7 is acidic (sour), above 7 is alkaline (basic). Most crops grow best in slightly acidic to neutral soil (pH 6.0-7.0). Wrong pH prevents plants from absorbing nutrients even if they're present in the soil."
    },
    
    NITROGEN: {
      title: "Soil Nitrogen (N)",
      content: "Nitrogen is the nutrient that makes plants grow green and leafy. It's essential for stem and leaf development. Plants with enough nitrogen have dark green leaves and strong growth. Too little nitrogen causes yellow leaves and stunted growth. Too much nitrogen causes excessive leaf growth but poor fruit/grain production."
    },
    
    PHOSPHORUS: {
      title: "Soil Phosphorus (P)",
      content: "Phosphorus helps plants develop strong roots, flowers, and fruits. It's crucial for seed formation and energy transfer within plants. Plants with enough phosphorus have good root systems and flower/fruit well. Too little phosphorus causes purple leaves and poor flowering. It's especially important during planting and flowering stages."
    },
    
    POTASSIUM: {
      title: "Soil Potassium (K)",
      content: "Potassium helps plants resist disease, cope with stress, and produce quality fruits. It regulates water movement and helps plants use other nutrients efficiently. Plants with enough potassium have strong stems and good disease resistance. Too little potassium causes brown leaf edges and weak plants that are easily damaged by wind or disease."
    },
    
    AIR_QUALITY: {
      title: "Air Quality (Gas Sensor)",
      content: "This measures harmful gases in the air around your crops, shown in PPM (Parts Per Million). It detects gases like ammonia from fertilizers, carbon dioxide, and other airborne chemicals. High levels of harmful gases can damage plant leaves and reduce growth. Good air quality means healthier plants and better yields."
    },
    
    RAIN_SENSOR: {
      title: "Rain Detection",
      content: "This sensor detects rainfall and measures its intensity. It shows readings like 'No Rain', 'Light Rain', or 'Heavy Rain'. Rain provides natural irrigation but too much can cause waterlogging and disease. Knowing rain patterns helps you plan irrigation - you can reduce watering when rain is expected and increase it during dry periods."
    },
    
    AIR_PRESSURE: {
      title: "Air Pressure",
      content: "This measures atmospheric pressure, which affects weather patterns and plant growth. Normal pressure is around 1013 hPa (hectopascals). Changes in pressure can indicate incoming weather changes that affect your crops. Low pressure often means stormy weather, while high pressure usually means clear skies. Sudden pressure changes can stress plants and affect their water uptake."
    },
    
    HISTORICAL_DATA: {
      title: "Historical Data Charts",
      content: "These charts show how your sensor readings have changed over time - hours, days, or weeks. Trends help you understand patterns in your field conditions. For example, you might see soil moisture dropping each day, telling you when to irrigate. Or temperature patterns might help you predict when pests will be active. Use these trends to make better farming decisions."
    }
  },
  
  ta: {
    TEMPERATURE: {
      title: "காற்று வெப்பநிலை",
      content: "இது உங்கள் பயிர்களைச் சுற்றியுள்ள காற்றின் வெப்பநிலையை அளவிடுகிறது. வெப்பநிலை தாவரங்கள் எவ்வளவு வேகமாக வளர்கின்றன, எப்போது பூக்கும், எவ்வளவு தண்ணீர் தேவை என்பதை பாதிக்கிறது. பெரும்பாலான பயிர்கள் 20-30°C (68-86°F) இடையில் சிறப்பாக வளர்கின்றன. அது மிகவும் சூடாக இருந்தால் (35°C க்கு மேல்), தாவரங்கள் வளர்வதை நிறுத்திவிடலாம் அல்லது அழுத்தமடையலாம். அது மிகவும் குளிராக இருந்தால் (15°C க்கு கீழ்), வளர்ச்சி கணிசமாக குறைந்துவிடும்."
    },
    
    HUMIDITY: {
      title: "காற்று ஈரப்பதம்",
      content: "இது உங்கள் பயிர்களைச் சுற்றியுள்ள காற்றில் எவ்வளவு ஈரப்பதம் உள்ளது என்பதைக் காட்டுகிறது. ஈரப்பதம் நோய் அபாயத்தையும் தாவர இலைகளிலிருந்து நீர் இழப்பையும் பாதிக்கிறது. பெரும்பாலான பயிர்களுக்கு 50-70% ஈரப்பதம் ஏற்றது. அதிக ஈரப்பதம் (80% க்கு மேல்) பூஞ்சை நோய்களையும் அச்சுத்தன்மையையும் ஏற்படுத்தும். குறைந்த ஈரப்பதம் (40% க்கு கீழ்) தாவரங்கள் தண்ணீரை வேகமாக இழக்கச் செய்து இலை எரிச்சலை ஏற்படுத்தும்."
    },
    
    SOIL_MOISTURE: {
      title: "மண் ஈரப்பதம்",
      content: "இது தாவர வேர்களைச் சுற்றியுள்ள மண்ணில் எவ்வளவு தண்ணீர் உள்ளது என்பதை அளவிடுகிறது. வாசிப்பு மூல சென்சார் மதிப்புகளை (ADC) காட்டுகிறது - குறைந்த எண்கள் அதிக ஈரப்பதத்தை குறிக்கின்றன. பெரும்பாலான பயிர்களுக்கு நிலையான ஈரப்பதம் தேவை ஆனால் தண்ணீர் தேக்கமடைந்த மண் அல்ல. ஏற்ற வரம்பு பயிர்களுக்கு ஏற்ப மாறுபடும்: காய்கறிகளுக்கு தானியங்களை விட அதிக தண்ணீர் தேவை. மிகவும் உலர்ந்தால் தாவரங்கள் வாடிவிடும்; மிகவும் ஈரமாக இருந்தால் வேர்கள் அழுகிவிடும்."
    },
    
    SOIL_TEMPERATURE: {
      title: "மண் வெப்பநிலை",
      content: "இது தாவர வேர்கள் வளரும் மண்ணின் வெப்பநிலையை அளவிடுகிறது. மண் வெப்பநிலை வேர் வளர்ச்சி, ஊட்டச்சத்து உறிஞ்சுதல், விதை முளைப்பு ஆகியவற்றை பாதிக்கிறது. பெரும்பாலான பயிர்கள் 18-24°C (64-75°F) இடையிலான மண் வெப்பநிலையை விரும்புகின்றன. குளிர் மண் (10°C க்கு கீழ்) வேர் வளர்ச்சியை மெதுவாக்குகிறது. சூடான மண் (30°C க்கு மேல்) வேர்களை சேதப்படுத்தி தண்ணீர் உறிஞ்சுதலை குறைக்கும்."
    },
    
    LIGHT_INTENSITY: {
      title: "ஒளி தீவிரம்",
      content: "இது உங்கள் பயிர்களை அடையும் ஒளியின் அளவை 'லக்ஸ்' அலகுகளில் அளவிடுகிறது. தாவரங்களுக்கு ஒளிச்சேர்க்கைக்கு (உணவு தயாரிப்பு) ஒளி தேவை. முழு சூரிய ஒளி சுமார் 50,000-100,000 லக்ஸ் ஆகும். பெரும்பாலான பயிர்களுக்கு நல்ல வளர்ச்சிக்கு குறைந்தது 10,000 லக்ஸ் தேவை. மிகக் குறைந்த ஒளி என்றால் பலவீனமான, நீண்ட தாவரங்கள். தக்காளி போன்ற பயிர்களை விட கீரை போன்ற சில பயிர்கள் குறைந்த ஒளியில் வளரலாம்."
    },
    
    SOIL_PH: {
      title: "மண் pH (அமிலத்தன்மை/கார தன்மை)",
      content: "இது உங்கள் மண் எவ்வளவு அமிலமானது அல்லது கார தன்மையானது என்பதை 0-14 அளவில் அளவிடுகிறது. 7 pH நடுநிலை. 7 க்கு கீழ் அமிலம் (புளிப்பு), 7 க்கு மேல் கார (அடிப்படை). பெரும்பாலான பயிர்கள் சற்று அமில முதல் நடுநிலை மண்ணில் (pH 6.0-7.0) சிறப்பாக வளர்கின்றன. தவறான pH மண்ணில் ஊட்டச்சத்துக்கள் இருந்தாலும் தாவரங்கள் உறிஞ்சுவதைத் தடுக்கிறது."
    },
    
    NITROGEN: {
      title: "மண் நைட்ரஜன் (N)",
      content: "நைட்ரஜன் தாவரங்களை பச்சையாகவும் இலை மிகுந்ததாகவும் வளர்க்கும் ஊட்டச்சத்து. இது தண்டு மற்றும் இலை வளர்ச்சிக்கு அவசியம். போதுமான நைட்ரஜன் உள்ள தாவரங்கள் அடர் பச்சை இலைகளையும் வலுவான வளர்ச்சியையும் கொண்டிருக்கும். மிகக் குறைந்த நைட்ரஜன் மஞ்சள் இலைகளையும் வளர்ச்சி தடையையும் ஏற்படுத்துகிறது. மிக அதிக நைட்ரஜன் அதிகப்படியான இலை வளர்ச்சியை ஏற்படுத்தும் ஆனால் மோசமான பழம்/தானிய உற்பத்தி."
    },
    
    PHOSPHORUS: {
      title: "மண் பாஸ்பரஸ் (P)",
      content: "பாஸ்பரஸ் தாவரங்கள் வலுவான வேர்கள், பூக்கள் மற்றும் பழங்களை வளர்க்க உதவுகிறது. இது விதை உருவாக்கம் மற்றும் தாவரங்களுக்குள் ஆற்றல் பரிமாற்றத்திற்கு முக்கியமானது. போதுமான பாஸ்பரஸ் உள்ள தாவரங்கள் நல்ல வேர் அமைப்புகளையும் நன்றாக பூக்கும்/பழமளிக்கும். மிகக் குறைந்த பாஸ்பரஸ் ஊதா இலைகளையும் மோசமான பூக்களையும் ஏற்படுத்துகிறது. நடவு மற்றும் பூக்கும் கட்டங்களில் இது குறிப்பாக முக்கியம்."
    },
    
    POTASSIUM: {
      title: "மண் பொட்டாசியம் (K)",
      content: "பொட்டாசியம் தாவரங்கள் நோயை எதிர்க்கவும், அழுத்தத்தைச் சமாளிக்கவும், தரமான பழங்களை உற்பத்தி செய்யவும் உதவுகிறது. இது நீர் இயக்கத்தை ஒழுங்குபடுத்தி மற்ற ஊட்டச்சத்துக்களை திறம்பட பயன்படுத்த உதவுகிறது. போதுமான பொட்டாசியம் உள்ள தாவரங்கள் வலுவான தண்டுகளையும் நல்ல நோய் எதிர்ப்பையும் கொண்டிருக்கும். மிகக் குறைந்த பொட்டாசியம் பழுப்பு இலை விளிம்புகளையும் காற்று அல்லது நோயால் எளிதில் சேதமடையும் பலவீனமான தாவரங்களையும் ஏற்படுத்துகிறது."
    },
    
    AIR_QUALITY: {
      title: "காற்றின் தரம் (வாயு சென்சார்)",
      content: "இது உங்கள் பயிர்களைச் சுற்றியுள்ள காற்றில் உள்ள தீங்கு விளைவிக்கும் வாயுக்களை PPM (பாகங்கள் / மில்லியன்) இல் அளவிடுகிறது. இது உரங்களிலிருந்து வரும் அம்மோனியா, கார்பன் டை ஆக்சைடு மற்றும் பிற காற்றில் பரவும் இரசாயனங்களை கண்டறிகிறது. தீங்கு விளைவிக்கும் வாயுக்களின் அதிக அளவு தாவர இலைகளை சேதப்படுத்தி வளர்ச்சியை குறைக்கும். நல்ல காற்றின் தரம் என்றால் ஆரோக்கியமான தாவரங்கள் மற்றும் சிறந்த மகசூல்."
    },
    
    RAIN_SENSOR: {
      title: "மழை கண்டறிதல்",
      content: "இந்த சென்சார் மழையை கண்டறிந்து அதன் தீவிரத்தை அளவிடுகிறது. இது 'மழை இல்லை', 'இலேசான மழை', அல்லது 'பலத்த மழை' போன்ற வாசிப்புகளை காட்டுகிறது. மழை இயற்கை நீர்ப்பாசனத்தை வழங்குகிறது ஆனால் அதிகமாக இருந்தால் தண்ணீர் தேக்கம் மற்றும் நோயை ஏற்படுத்தும். மழை முறைகளை தெரிந்துகொள்வது நீர்ப்பாசனத்தை திட்டமிட உதவுகிறது - மழை எதிர்பார்க்கும்போது நீர்ப்பாசனத்தை குறைக்கலாம் மற்றும் வறண்ட காலங்களில் அதிகரிக்கலாம்."
    },
    
    AIR_PRESSURE: {
      title: "காற்று அழுத்தம்",
      content: "இது வானிலை முறைகளையும் தாவர வளர்ச்சியையும் பாதிக்கும் வளிமண்டல அழுத்தத்தை அளவிடுகிறது. சாதாரண அழுத்தம் 1013 hPa (ஹெக்டோபாஸ்கல்) ஆகும். அழுத்த மாற்றங்கள் உங்கள் பயிர்களை பாதிக்கும் வரும் வானிலை மாற்றங்களை குறிக்கலாம். குறைந்த அழுத்தம் பொதுவாக புயல் வானிலையை அர்த்தப்படுத்துகிறது, அதே நேரத்தில் உயர் அழுத்தம் பொதுவாக தெளிவான வானத்தை அர்த்தப்படுத்துகிறது. திடீர் அழுத்த மாற்றங்கள் தாவரங்களை அழுத்தமடையச் செய்து அவற்றின் தண்ணீர் உறிஞ்சுதலை பாதிக்கும்."
    },
    
    HISTORICAL_DATA: {
      title: "வரலாற்று தரவு அட்டவணைகள்",
      content: "இந்த அட்டவணைகள் உங்கள் சென்சார் வாசிப்புகள் காலப்போக்கில் - மணி நேரங்கள், நாட்கள், அல்லது வாரங்களில் எவ்வாறு மாறியுள்ளன என்பதைக் காட்டுகின்றன. போக்குகள் உங்கள் வயல் நிலைமைகளில் உள்ள முறைகளை புரிந்துகொள்ள உதவுகின்றன. உதாரணமாக, மண் ஈரப்பதம் ஒவ்வொரு நாளும் குறைவதை நீங்கள் பார்க்கலாம், இது எப்போது நீர்ப்பாசனம் செய்ய வேண்டும் என்பதை உங்களுக்குச் சொல்லுகிறது. அல்லது வெப்பநிலை முறைகள் பூச்சிகள் எப்போது செயல்படும் என்பதை கணிக்க உதவலாம். இந்த போக்குகளை சிறந்த விவசாய முடிவுகள் எடுக்க பயன்படுத்துங்கள்."
    }
  },
  
  si: {
    TEMPERATURE: {
      title: "වායු උෂ්ණත්වය",
      content: "මෙය ඔබේ භෝගවල් වටා ඇති වාතයේ උෂ්ණත්වය මනයි. උෂ්ණත්වය ශාක කොතරම් වේගයෙන් වර්ධනය වන්නේද, ඒවා කවදා පහන් හටගන්නේද, සහ ඒවාට කොපමණ ජලය අවශ්‍ය වන්නේද යන්න කෙරෙහි බලපායි. බොහෝ බෝග 20-30°C (68-86°F) අතර හොඳින් වර්ධනය වේ. එය ඉතා උණුසුම් නම් (35°C ට වඩා), ශාක වර්ධනය වීම නවත්වනු ලැබිය හැකි අතර හෝ ආතතියට ලක් වනු ලැබේ. එය ඉතා සීතල නම් (15°C ට වඩා අඩු), වර්ධනය සැලකිය යුතු ලෙස මන්දගාමී වේ."
    },
    
    HUMIDITY: {
      title: "වායු ආර්ද්‍රතාවය",
      content: "මෙය ඔබේ භෝගවල් වටා ඇති වාතයේ ඇති තෙතමනය පෙන්වයි. ආර්ද්‍රතාවය රෝග අවදානම සහ ශාක පත්‍රවලින් ජල නැතිවීම කෙරෙහි බලපායි. බොහෝ භෝගවල සඳහා 50-70% ආර්ද්‍රතාවය සුදුසුය. ඉහළ ආර්ද්‍රතාවය (80% කට වඩා) දිලීර රෝග සහ අච්චු ඇති විය හැකිය. අඩු ආර්ද්‍රතාවය (40% කට වඩා අඩු) ශාක වේගයෙන් ජලය අහිමි කරවන අතර පත්‍ර පිළිස්සීම් ඇති විය හැකිය."
    },
    
    SOIL_MOISTURE: {
      title: "පාංශු තෙතමනය",
      content: "මෙය ශාක මුල් වටා ඇති පසේ ඇති ජල ප්‍රමාණය මනයි. කියවීම අමු සංවේදක අගයන් (ADC) පෙන්වයි - අඩු සංඛ්‍යා වැඩි තෙතමනය අදහස් කරයි. බොහෝ භෝගවලට ස්ථායී තෙතමනය අවශ්‍ය වන නමුත් ජල තැම්පතු වූ පස නොවේ. වැඩි සුදුසු පරාසය භෝගය අනුව වෙනස් වේ: එළවළු වලට ධාන්‍ය වලට වඩා වැඩි ජලය අවශ්‍ය වේ. ඉතා වියළි නම් ශාක වෙල්ලා යනු ඇත; ඉතා තෙත් නම් මුල් දිරුණු විය හැකිය."
    },
    
    SOIL_TEMPERATURE: {
      title: "පාංශු උෂ්ණත්වය",
      content: "මෙය ශාක මුල් වර්ධනය වන පසෙහි උෂ්ණත්වය මනයි. පාංශු උෂ්ණත්වය මුල් වර්ධනය, පෝෂක අවශෝෂණය, සහ බීජ ප්‍රරෝහණය කෙරෙහි බලපායි. බොහෝ භෝගවල 18-24°C (64-75°F) අතර පාංශු උෂ්ණත්වයට වැඩි කැමැත්තක් දක්වයි. සීතල පස (10°C ට වඩා අඩු) මුල් වර්ධනය මන්දගාමී කරයි. උණුසුම් පස (30°C ට වඩා) මුල් වලට හානි කර ජල අවශෝෂණය අඩු කරයි."
    },
    
    LIGHT_INTENSITY: {
      title: "ආලෝක තීව්‍රතාවය",
      content: "මෙය ඔබේ භෝගවල වෙත ළඟා වන ආලෝක ප්‍රමාණය 'ලක්ස්' ඒකකවලින් මනයි. ශාකවලට ප්‍රභාසංශ්ලේෂණය (ආහාර නිර්මාණය) සඳහා ආලෝකය අවශ්‍ය වේ. සම්පූර්ණ සූර්ය ආලෝකය 50,000-100,000 ලක්ස් පමණ වේ. බොහෝ භෝගවලට හොඳ වර්ධනය සඳහා අවම වශයෙන් 10,000 ලක්ස් අවශ්‍ය වේ. ඉතා අඩු ආලෝකය යනු දුර්වල, කම්බි සහිත ශාක. සලාද වැනි සමහර භෝගවලට තක්කාලි වැනි අනෙක් ඒවාට වඩා අඩු ආලෝකයෙන් වර්ධනය වීමට හැකිය."
    },
    
    SOIL_PH: {
      title: "පාංශු pH (ආම්ලිකත්වය/ක්ෂාරීයත්වය)",
      content: "මෙය ඔබේ පස කොතරම් ආම්ලික හෝ ක්ෂාරීය ද යන්න 0-14 පරිමාණයකින් මනයි. 7 pH මධ්‍යම වේ. 7 ට වඩා අඩු ආම්ලික (ඇම්බුල්), 7 ට වඩා ක්ෂාරීය (මූලික) වේ. බොහෝ භෝගවල තරමක් ආම්ලික සිට මධ්‍යම පසේ (pH 6.0-7.0) හොඳින් වර්ධනය වේ. වැරදි pH පසේ පෝෂක තිබුණත් ශාක අවශෝෂණය කර ගැනීම වළක්වයි."
    },
    
    NITROGEN: {
      title: "පාංශු නයිට්‍රජන් (N)",
      content: "නයිට්‍රජන් යනු ශාක පේ‍ර සහ පත්‍රමය වර්ධනය කරවන පෝෂකයකි. එය කාණ්ඩ සහ පත්‍ර වර්ධනය සඳහා අත්‍යවශ්‍ය වේ. ප්‍රමාණවත් නයිට්‍රජන් ඇති ශාකවලට අඳුරු හරිත පත්‍ර සහ ශක්තිමත් වර්ධනය ඇත. ඉතා අඩු නයිට්‍රජන් කහ පත්‍ර සහ වර්ධන අඩාලය ඇති කරයි. ඉතා වැඩි නයිට්‍රජන් අධික පත්‍ර වර්ධනය ඇති කරන නමුත් දුර්වල පළතුරු/ධාන්‍ය නිෂ්පාදනය වේ."
    },
    
    PHOSPHORUS: {
      title: "පාංශු පොස්පරස් (P)",
      content: "පොස්පරස් ශාකවලට ශක්තිමත් මුල්, මල් සහ පළතුරු වර්ධනය කිරීමට උපකාරී වේ. එය බීජ සෑදීම සහ ශාක තුළ ශක්ති හුවමාරුව සඳහා අත්‍යවශ්‍ය වේ. ප්‍රමාණවත් පොස්පරස් ඇති ශාකවලට හොඳ මුල් පද්ධති ඇති අතර මල්/පළතුරු හොඳින් ලබා දේ. ඉතා අඩු පොස්පරස් ජම්බු පත්‍ර සහ දුර්වල මල් ඇති කරයි. එය රෝපණ සහ මල් හැදෙන කාලවලදී විශේෂයෙන් වැදගත් වේ."
    },
    
    POTASSIUM: {
      title: "පාංශු පොටෑසියම් (K)",
      content: "පොටෑසියම් ශාකවලට රෝගවලට ප්‍රතිරෝධය දැක්වීමට, ආතතියට මුහුණ දීමට, සහ ගුණාත්මක පළතුරු නිෂ්පාදනය කිරීමට උපකාරී වේ. එය ජල චලනය නියාමනය කරන අතර අනෙකුත් පෝෂක කාර්යක්ෂමව භාවිතා කිරීමට උපකාරී වේ. ප්‍රමාණවත් පොටෑසියම් ඇති ශාකවලට ශක්තිමත් කාණ්ඩ සහ හොඳ රෝග ප්‍රතිරෝධයක් ඇත. ඉතා අඩු පොටෑසියම් දුඹුරු පත්‍ර මායිම් සහ සුළඟින් හෝ රෝගවලින් පහසුවෙන් හානි වන දුර්වල ශාක ඇති කරයි."
    },
    
    AIR_QUALITY: {
      title: "වායු ගුණාත්මකභාවය (වායු සංවේදකය)",
      content: "මෙය ඔබේ භෝගවල් වටා ඇති වාතයේ ඇති හානිකර වායු PPM (මිලියනයට කොටස්) වලින් මනයි. එය පොහොර වලින් ඇති ඇමෝනියා, කාබන් ඩයොක්සයිඩ් සහ අනෙකුත් වාතයෙන් පැතිරෙන රසායනික ද්‍රව්‍ය හඳුනා ගනී. හානිකර වායු වල ඉහළ මට්ටම් ශාක පත්‍ර වලට හානි කර වර්ධනය අඩු කරයි. හොඳ වායු ගුණාත්මකභාවය යනු සෞඛ්‍ය සම්පන්න ශාක සහ වඩා හොඳ අස්වැන්න වේ."
    },
    
    RAIN_SENSOR: {
      title: "වර්ෂා හඳුනාගැනීම",
      content: "මෙම සංවේදකය වර්ෂාව හඳුනා ගෙන එහි තීව්‍රතාවය මනයි. එය 'වැස්සක් නැත', 'සැහැල්ලු වර්ෂාව', හෝ 'දැඩි වර්ෂාව' වැනි කියවීම් පෙන්වයි. වර්ෂාව ස්වභාවික වාරිමාර්ග සපයන නමුත් ඉතා වැඩි නම් ජල තැන්පත් වීම සහ රෝග ඇති විය හැකිය. වර්ෂා රටා දැන ගැනීම වාරිමාර්ග සැලසුම් කිරීමට උපකාරී වේ - වර්ෂාව අපේක්ෂා කරන විට ජලය දීම අඩු කිරීමට හැකි අතර වියළි කාලවල වැඩි කිරීමට හැකිය."
    },
    
    AIR_PRESSURE: {
      title: "වායු පීඩනය",
      content: "මෙය කාලගුණික රටා සහ ශාක වර්ධනය කෙරෙහි බලපාන වායුමණ්ඩලීය පීඩනය මනයි. සාමාන්‍ය පීඩනය 1013 hPa (හෙක්ටොපාස්කල්) පමණ වේ. පීඩන වෙනස්කම් ඔබේ භෝග වලට බලපාන ලැගෙන්නට යන කාලගුණික වෙනස්කම් දක්වන්නට හැකිය. අඩු පීඩනය බොහෝ විට කුණාටුකාරී කාලගුණය අදහස් කරන අතර, ඉහළ පීඩනය සාමාන්‍යයෙන් පැහැදිලි අහස අදහස් කරයි. හදිසි පීඩන වෙනස්කම් ශාකවලට ආතතියක් ලබා දීමට සහ ඒවායේ ජල අවශෝෂණයට බලපෑමට හැකිය."
    },
    
    HISTORICAL_DATA: {
      title: "ඓතිහාසික දත්ත ප්‍රස්ථාර",
      content: "මෙම ප්‍රස්ථාර ඔබේ සංවේදක කියවීම් කාලය පුරා - පැය, දින, හෝ සති - කොසේ වෙනස් වී ඇත්ද යන්න පෙන්වයි. නැඹුරුව ඔබේ ක්ෂේත්‍ර තත්ත්වයන්හි රටා තේරුම් ගැනීමට උපකාරී වේ. උදාහරණයක් ලෙස, පාංශු තෙතමනය සෑම දිනකම අඩු වන්නට ඔබට පෙනෙන්නට ඇති අතර, එය කවදා වාරිමාර්ග කළ යුතුද යන්න ඔබට පවසයි. හෝ උෂ්ණත්ව රටා සෘතු සත්වයින් කවදා සක්‍රීය වන්නේද යන්න පුරෝකථනය කිරීමට උපකාරී වේ. වඩා හොඳ කෘෂිකාර්මික තීරණ ගැනීම සඳහා මෙම නැඹුරුව භාවිතා කරන්න."
    }
  }
};

// Status tooltips for different sensor readings
export const STATUS_TOOLTIPS: TooltipContentByLanguage = {
  en: {
    OPTIMAL: {
      title: "Optimal",
      content: "Conditions are perfect for plant growth and health."
    },
    STABLE: {
      title: "Stable",
      content: "Conditions are good and within acceptable ranges."
    },
    WARNING: {
      title: "Warning",
      content: "Conditions are approaching problematic levels - monitor closely."
    },
    CRITICAL: {
      title: "Critical",
      content: "Conditions need immediate attention to prevent crop damage."
    },
    DRY_NEEDS_IRRIGATION: {
      title: "Dry - Needs Irrigation",
      content: "Soil is too dry - plants may be stressed and need water soon."
    },
    OPTIMAL_MOISTURE: {
      title: "Optimal Moisture",
      content: "Soil moisture is perfect for healthy plant growth."
    },
    WET_REDUCE_IRRIGATION: {
      title: "Wet - Reduce Irrigation",
      content: "Soil is quite wet - reduce watering to prevent root problems."
    },
    WATERLOGGED: {
      title: "Waterlogged",
      content: "Soil is too wet - drainage needed to prevent root rot."
    },
    TOO_COLD: {
      title: "Too Cold",
      content: "Temperature is too low - plant growth will be slow."
    },
    OPTIMAL_TEMPERATURE: {
      title: "Optimal Temperature",
      content: "Temperature is perfect for plant growth."
    },
    TOO_HOT: {
      title: "Too Hot",
      content: "Temperature is too high - plants may be stressed."
    },
    TOO_DRY: {
      title: "Too Dry",
      content: "Air is too dry - plants may lose water quickly."
    },
    OPTIMAL_HUMIDITY: {
      title: "Optimal Humidity",
      content: "Air humidity is perfect for plant health."
    },
    TOO_HUMID: {
      title: "Too Humid",
      content: "Air is too humid - risk of fungal diseases increases."
    },
    TOO_DARK: {
      title: "Too Dark",
      content: "Not enough light - plants may grow weak and spindly."
    },
    ADEQUATE_LIGHT: {
      title: "Adequate Light",
      content: "Good light levels for plant growth."
    },
    INTENSE_LIGHT: {
      title: "Intense Light",
      content: "Very bright light - may cause leaf burn in sensitive plants."
    },
    NO_RAIN: {
      title: "No Rain",
      content: "No rainfall detected - irrigation may be needed."
    },
    LIGHT_RAIN: {
      title: "Light Rain",
      content: "Light rainfall detected - natural irrigation is occurring."
    },
    HEAVY_RAIN: {
      title: "Heavy Rain",
      content: "Heavy rainfall detected - check for waterlogging."
    }
  },
  
  ta: {
    OPTIMAL: {
      title: "உகந்த",
      content: "தாவர வளர்ச்சி மற்றும் ஆரோக்கியத்திற்கு நிலைமைகள் சரியானவை."
    },
    STABLE: {
      title: "நிலையான",
      content: "நிலைமைகள் நல்லவை மற்றும் ஏற்றுக்கொள்ளக்கூடிய வரம்புகளுக்குள் உள்ளன."
    },
    WARNING: {
      title: "எச்சரிக்கை",
      content: "நிலைமைகள் பிரச்சனைகரமான நிலைகளை அணுகுகின்றன - உன்னிப்பாக கண்காணிக்கவும்."
    },
    CRITICAL: {
      title: "முக்கியமான",
      content: "பயிர் சேதத்தை தடுக்க உடனடி கவனம் தேவை."
    },
    DRY_NEEDS_IRRIGATION: {
      title: "உலர்ந்த - நீர்ப்பாசனம் தேவை",
      content: "மண் மிகவும் உலர்ந்துள்ளது - தாவரங்கள் அழுத்தமடைந்து விரைவில் தண்ணீர் தேவைப்படலாம்."
    },
    OPTIMAL_MOISTURE: {
      title: "உகந்த ஈரப்பதம்",
      content: "மண் ஈரப்பதம் ஆரோக்கியமான தாவர வளர்ச்சிக்கு சரியானது."
    },
    WET_REDUCE_IRRIGATION: {
      title: "ஈரமான - நீர்ப்பாசனம் குறைக்கவும்",
      content: "மண் மிகவும் ஈரமாக உள்ளது - வேர் பிரச்சனைகளை தடுக்க நீர்ப்பாசனத்தை குறைக்கவும்."
    },
    WATERLOGGED: {
      title: "தண்ணீர் தேக்கம்",
      content: "மண் மிகவும் ஈரமாக உள்ளது - வேர் அழுகலை தடுக்க வடிகாலேற்பாடு தேவை."
    },
    TOO_COLD: {
      title: "மிகவும் குளிர்",
      content: "வெப்பநிலை மிகவும் குறைவு - தாவர வளர்ச்சி மெதுவாக இருக்கும்."
    },
    OPTIMAL_TEMPERATURE: {
      title: "உகந்த வெப்பநிலை",
      content: "வெப்பநிலை தாவர வளர்ச்சிக்கு சரியானது."
    },
    TOO_HOT: {
      title: "மிகவும் சூடு",
      content: "வெப்பநிலை மிகவும் அதிகம் - தாவரங்கள் அழுத்தமடையலாம்."
    },
    TOO_DRY: {
      title: "மிகவும் உலர்ந்த",
      content: "காற்று மிகவும் உலர்ந்துள்ளது - தாவரங்கள் விரைவாக தண்ணீர் இழக்கலாம்."
    },
    OPTIMAL_HUMIDITY: {
      title: "உகந்த ஈரப்பதம்",
      content: "காற்று ஈரப்பதம் தாவர ஆரோக்கியத்திற்கு சரியானது."
    },
    TOO_HUMID: {
      title: "மிகவும் ஈரப்பதம்",
      content: "காற்று மிகவும் ஈரப்பதமாக உள்ளது - பூஞ்சை நோய்களின் அபாயம் அதிகரிக்கிறது."
    },
    TOO_DARK: {
      title: "மிகவும் இருள்",
      content: "போதுமான ஒளி இல்லை - தாவரங்கள் பலவீனமாகவும் நீளமாகவும் வளரலாம்."
    },
    ADEQUATE_LIGHT: {
      title: "போதுமான ஒளி",
      content: "தாவர வளர்ச்சிக்கு நல்ல ஒளி அளவுகள்."
    },
    INTENSE_LIGHT: {
      title: "தீவிரமான ஒளி",
      content: "மிகவும் பிரகாசமான ஒளி - உணர்திறன் தாவரங்களில் இலை எரிச்சல் ஏற்படலாம்."
    },
    NO_RAIN: {
      title: "மழை இல்லை",
      content: "மழை கண்டறியப்படவில்லை - நீர்ப்பாசனம் தேவைப்படலாம்."
    },
    LIGHT_RAIN: {
      title: "இலேசான மழை",
      content: "இலேசான மழை கண்டறியப்பட்டது - இயற்கை நீர்ப்பாசனம் நடைபெறுகிறது."
    },
    HEAVY_RAIN: {
      title: "கனமழை",
      content: "கனமழை கண்டறியப்பட்டது - தண்ணீர் தேக்கத்தை சரிபார்க்கவும்."
    }
  },
  
  si: {
    OPTIMAL: {
      title: "ප්‍රශස්ත",
      content: "ශාක වර්ධනය සහ සෞඛ්‍යය සඳහා තත්ත්වයන් පරිපූර්ණයි."
    },
    STABLE: {
      title: "ස්ථායී",
      content: "තත්ත්වයන් හොඳ අතර පිළිගත් සීමාවන් තුළ ඇත."
    },
    WARNING: {
      title: "අනතුරු ඇඟවීම",
      content: "තත්ත්වයන් ගැටළුකර මට්ටම් වෙත ළංවෙමින් - සමීපව නිරීක්ෂණය කරන්න."
    },
    CRITICAL: {
      title: "අත්‍යාවශ්‍ය",
      content: "භෝග හානිය වැළැක්වීමට ක්ෂණික අවධානය අවශ්‍ය වේ."
    },
    DRY_NEEDS_IRRIGATION: {
      title: "වියළී - වාරිමාර්ග අවශ්‍ය",
      content: "පස ඉතා වියළී - ශාක ආතතියට ලක්වී ඉක්මනින් ජලය අවශ්‍ය වේ."
    },
    OPTIMAL_MOISTURE: {
      title: "ප්‍රශස්ත තෙතමනය",
      content: "පාංශු තෙතමනය සෞඛ්‍ය සම්පන්න ශාක වර්ධනය සඳහා පරිපූර්ණයි."
    },
    WET_REDUCE_IRRIGATION: {
      title: "තෙත් - වාරිමාර්ග අඩු කරන්න",
      content: "පස තරමක් තෙත් - මුල් ගැටළු වැළැක්වීමට ජලය දීම අඩු කරන්න."
    },
    WATERLOGGED: {
      title: "ජල තැන්පත්",
      content: "පස ඉතා තෙත් - මුල් දිරාපත් වීම වැළැක්වීමට ජලය බැස යාම අවශ්‍ය."
    },
    TOO_COLD: {
      title: "ඉතා සීතල",
      content: "උෂ්ණත්වය ඉතා අඩු - ශාක වර්ධනය මන්දගාමී වනු ඇත."
    },
    OPTIMAL_TEMPERATURE: {
      title: "ප්‍රශස්ත උෂ්ණත්වය",
      content: "උෂ්ණත්වය ශාක වර්ධනය සඳහා පරිපූර්ණයි."
    },
    TOO_HOT: {
      title: "ඉතා උණුසුම්",
      content: "උෂ්ණත්වය ඉතා ඉහළ - ශාක ආතතියට ලක් වනු ඇත."
    },
    TOO_DRY: {
      title: "ඉතා වියළී",
      content: "වාතය ඉතා වියළී - ශාක වේගයෙන් ජලය අහිමි වේ."
    },
    OPTIMAL_HUMIDITY: {
      title: "ප්‍රශස්ත ආර්ද්‍රතාවය",
      content: "වායු ආර්ද්‍රතාවය ශාක සෞඛ්‍යයට පරිපූර්ණයි."
    },
    TOO_HUMID: {
      title: "ඉතා ආර්ද්‍රතාව",
      content: "වාතය ඉතා තෙත් - දිලීර රෝගවල අවදානම වැඩි වේ."
    },
    TOO_DARK: {
      title: "ඉතා අඳුර",
      content: "ප්‍රමාණවත් ආලෝකයක් නැත - ශාක දුර්වල හා දිගු වර්ධනය වේ."
    },
    ADEQUATE_LIGHT: {
      title: "ප්‍රමාණවත් ආලෝකය",
      content: "ශාක වර්ධනය සඳහා හොඳ ආලෝක මට්ටම්."
    },
    INTENSE_LIGHT: {
      title: "තීව්‍ර ආලෝකය",
      content: "ඉතා දීප්තිමත් ආලෝකය - සංවේදී ශාකවල පත්‍ර පිළිස්සීම් ඇති වේ."
    },
    NO_RAIN: {
      title: "වර්ෂාවක් නැත",
      content: "වර්ෂාව හඳුනා ගත නොහැකි - වාරිමාර්ග අවශ්‍ය වේ."
    },
    LIGHT_RAIN: {
      title: "සැහැල්ලු වර්ෂාව",
      content: "සැහැල්ලු වර්ෂාව හඳුනා ගන්නා ලදී - ස්වභාවික වාරිමාර්ග සිදුවේ."
    },
    HEAVY_RAIN: {
      title: "දැඩි වර්ෂාව",
      content: "දැඩි වර්ෂාව හඳුනා ගන්නා ලදී - ජල තැන්පත්වීම පරීක්ෂා කරන්න."
    }
  }
};

// Chart-specific tooltips
export const CHART_TOOLTIPS: TooltipContentByLanguage = {
  en: {
    AREA_CHART: {
      title: "Area Chart",
      content: "This area chart shows how values change over time. The colored area makes it easy to see trends and patterns."
    },
    LINE_CHART: {
      title: "Line Chart",
      content: "This line chart shows the exact progression of values over time. Each point represents a sensor reading."
    },
    BAR_CHART: {
      title: "Bar Chart",
      content: "This bar chart compares values across different time periods or categories."
    },
    TEMPERATURE_CHART: {
      title: "Temperature Chart",
      content: "Track temperature changes to optimize planting times and predict plant development stages."
    },
    HUMIDITY_CHART: {
      title: "Humidity Chart",
      content: "Monitor humidity patterns to prevent diseases and optimize irrigation timing."
    },
    MOISTURE_CHART: {
      title: "Soil Moisture Chart",
      content: "Watch soil moisture trends to perfect your irrigation schedule and avoid over/under-watering."
    },
    LIGHT_CHART: {
      title: "Light Chart",
      content: "Track light patterns to understand how much sunlight your crops receive throughout the day."
    },
    NPK_CHART: {
      title: "NPK Chart",
      content: "Monitor nutrient levels over time to know when and how much fertilizer to apply."
    },
    YIELD_PREDICTION: {
      title: "Yield Prediction Chart",
      content: "This chart shows predicted crop yields based on current growing conditions. Use these predictions to plan harvesting and market timing."
    },
    DISEASE_DETECTION: {
      title: "Disease Detection Chart",
      content: "This chart shows the health status of your crops. Green indicates healthy plants, while red shows potential disease issues that need attention."
    },
    SOIL_QUALITY: {
      title: "Soil Quality Chart",
      content: "This chart shows different aspects of your soil quality as percentages. Higher percentages indicate better soil conditions for crop growth."
    }
  },
  
  ta: {
    AREA_CHART: {
      title: "பகுதி அட்டவணை",
      content: "இந்த பகுதி அட்டவணை மதிப்புகள் காலப்போக்கில் எவ்வாறு மாறுகின்றன என்பதைக் காட்டுகிறது. வண்ணமிடப்பட்ட பகுதி போக்குகள் மற்றும் முறைகளை பார்க்க எளிதாக்குகிறது."
    },
    LINE_CHART: {
      title: "கோடு அட்டவணை",
      content: "இந்த கோடு அட்டவணை காலப்போக்கில் மதிப்புகளின் சரியான முன்னேற்றத்தை காட்டுகிறது. ஒவ்வொரு புள்ளியும் ஒரு சென்சார் வாசிப்பைக் குறிக்கிறது."
    },
    BAR_CHART: {
      title: "பட்டி அட்டவணை",
      content: "இந்த பட்டி அட்டவணை வெவ்வேறு கால காலங்கள் அல்லது வகைகளில் மதிப்புகளை ஒப்பிடுகிறது."
    },
    TEMPERATURE_CHART: {
      title: "வெப்பநிலை அட்டவணை",
      content: "நடவு நேரங்களை உகந்ததாக்க மற்றும் தாவர வளர்ச்சி கட்டங்களை கணிக்க வெப்பநிலை மாற்றங்களை கண்காணிக்கவும்."
    },
    HUMIDITY_CHART: {
      title: "ஈரப்பதம் அட்டவணை",
      content: "நோய்களைத் தடுக்க மற்றும் நீர்ப்பாசன நேரத்தை உகந்ததாக்க ஈரப்பதம் முறைகளை கண்காணிக்கவும்."
    },
    MOISTURE_CHART: {
      title: "மண் ஈரப்பதம் அட்டவணை",
      content: "உங்கள் நீர்ப்பாசன அட்டவணையை சரியாக்க மற்றும் அதிக/குறைந்த நீர்ப்பாசனத்தை தவிர்க்க மண் ஈரப்பதம் போக்குகளை கவனிக்கவும்."
    },
    LIGHT_CHART: {
      title: "ஒளி அட்டவணை",
      content: "உங்கள் பயிர்கள் நாள் முழுவதும் எவ்வளவு சூரிய ஒளியைப் பெறுகின்றன என்பதைப் புரிந்துகொள்ள ஒளி முறைகளை கண்காணிக்கவும்."
    },
    NPK_CHART: {
      title: "NPK அட்டவணை",
      content: "எப்போது மற்றும் எவ்வளவு உரம் பயன்படுத்த வேண்டும் என்பதை அறிய காலப்போக்கில் ஊட்டச்சத்து அளவுகளை கண்காணிக்கவும்."
    },
    YIELD_PREDICTION: {
      title: "விளைச்சல் கணிப்பு அட்டவணை",
      content: "இந்த அட்டவணை தற்போதைய வளர்ச்சி நிலைமைகளின் அடிப்படையில் கணிக்கப்பட்ட பயிர் விளைச்சலைக் காட்டுகிறது. அறுவடை மற்றும் சந்தை நேரத்தை திட்டமிட இந்த கணிப்புகளைப் பயன்படுத்தவும்."
    },
    DISEASE_DETECTION: {
      title: "நோய் கண்டறிதல் அட்டவணை",
      content: "இந்த அட்டவணை உங்கள் பயிர்களின் ஆரோக்கிய நிலையைக் காட்டுகிறது. பச்சை நிறம் ஆரோக்கியமான தாவரங்களைக் குறிக்கிறது, அதே நேரத்தில் சிவப்பு நிறம் கவனம் தேவைப்படும் சாத்தியமான நோய் பிரச்சினைகளைக் காட்டுகிறது."
    },
    SOIL_QUALITY: {
      title: "மண் தரம் அட்டவணை",
      content: "இந்த அட்டவணை உங்கள் மண் தரத்தின் வெவ்வேறு அம்சங்களை சதவிகிதமாக காட்டுகிறது. அதிக சதவிகிதங்கள் பயிர் வளர்ச்சிக்கு சிறந்த மண் நிலைமைகளைக் குறிக்கின்றன."
    }
  },
  
  si: {
    AREA_CHART: {
      title: "ප්‍රදේශ ප්‍රස්ථාරය",
      content: "මෙම ප්‍රදේශ ප්‍රස්ථාරය කාලයත් සමඟ අගයන් වෙනස් වන්නේ කෙසේද යන්න පෙන්වයි. වර්ණ ගත කරන ලද ප්‍රදේශය නැඹුරුව සහ රටා දැකීම පහසු කරයි."
    },
    LINE_CHART: {
      title: "රේඛා ප්‍රස්ථාරය",
      content: "මෙම රේඛා ප්‍රස්ථාරය කාලයත් සමඟ අගයන්ගේ නිශ්චිත ප්‍රගතිය පෙන්වයි. සෑම ලක්ෂ්‍යයක්ම සංවේදක කියවීමක් නියෝජනය කරයි."
    },
    BAR_CHART: {
      title: "දණ්ඩ ප්‍රස්ථාරය",
      content: "මෙම දණ්ඩ ප්‍රස්ථාරය විවිධ කාල කාලවල හෝ කාණ්ඩ හරහා අගයන් සංසන්දනය කරයි."
    },
    TEMPERATURE_CHART: {
      title: "උෂ්ණත්ව ප්‍රස්ථාරය",
      content: "රෝපණ කාල ප්‍රශස්ත කිරීමට සහ ශාක වර්ධන අදියර අනාවැකි පැවසීමට උෂ්ණත්ව වෙනස්කම් නිරීක්ෂණය කරන්න."
    },
    HUMIDITY_CHART: {
      title: "ආර්ද්‍රතාව ප්‍රස්ථාරය",
      content: "රෝග වැළැක්වීමට සහ වාරිමාර්ග වේලාව ප්‍රශස්ත කිරීමට ආර්ද්‍රතාව රටා නිරීක්ෂණය කරන්න."
    },
    MOISTURE_CHART: {
      title: "පාංශු තෙතමනය ප්‍රස්ථාරය",
      content: "ඔබේ වාරිමාර්ග කාලසටහන පරිපූර්ණ කිරීමට සහ වැඩි/අඩු ජලය දීම වළක්වීමට පාංශු තෙතමනය නැඹුරුව නිරීක්ෂණය කරන්න."
    },
    LIGHT_CHART: {
      title: "ආලෝක ප්‍රස්ථාරය",
      content: "ඔබේ භෝග දවස පුරා කොපමණ සූර්ය ආලෝකයක් ලබන්නේද යන්න තේරුම් ගැනීමට ආලෝක රටා නිරීක්ෂණය කරන්න."
    },
    NPK_CHART: {
      title: "NPK ප්‍රස්ථාරය",
      content: "කවදා සහ කොපමණ පොහොරක් යොදන්නේද යන්න දැනගැනීමට කාලයත් සමඟ පෝෂක මට්ටම් නිරීක්ෂණය කරන්න."
    },
    YIELD_PREDICTION: {
      title: "අස්වන්න අනාවැකි ප්‍රස්ථාරය",
      content: "මෙම ප්‍රස්ථාරය වර්තමාන වර්ධන තත්ත්වයන් මත පදනම්ව අනාවැකි කරන ලද භෝග අස්වන්න පෙන්වයි. අස්වන්න සහ වෙළඳපොල කාල සැලසුම සඳහා මෙම අනාවැකි භාවිතා කරන්න."
    },
    DISEASE_DETECTION: {
      title: "රෝග හඳුනාගැනීම ප්‍රස්ථාරය",
      content: "මෙම ප්‍රස්ථාරය ඔබේ භෝගවල සෞඛ්‍ය තත්ත්වය පෙන්වයි. කොළ වර්ණය සෞඛ්‍ය සම්පන්න ශාක දැක්වන අතර, රතු වර්ණය අවධානය අවශ්‍ය වන විභව රෝග ගැටළු පෙන්වයි."
    },
    SOIL_QUALITY: {
      title: "පාංශු ගුණත්ව ප්‍රස්ථාරය",
      content: "මෙම ප්‍රස්ථාරය ඔබේ පාංශු ගුණත්වයේ විවිධ අංශ ප්‍රතිශත වශයෙන් පෙන්වයි. ඉහළ ප්‍රතිශත භෝග වර්ධනය සඳහා වඩා හොඳ පාංශු තත්ත්වයන් දැක්වයි."
    }
  }
};

// Analytics page tooltips
export const ANALYTICS_TOOLTIPS: TooltipContentByLanguage = {
  en: {
    MONTHLY_YIELD: {
      title: "Monthly Yield Analysis",
      content: "This chart shows your crop yields month by month. Use this to identify seasonal patterns, track improvements, and plan better harvest schedules. Higher bars indicate more productive months."
    },
    SOIL_MOISTURE_TRENDS: {
      title: "Soil Moisture Trends",
      content: "This chart tracks soil moisture levels over time. It helps you understand seasonal moisture patterns and optimize your irrigation schedule. Consistent moisture levels usually lead to better crop growth."
    },
    PEST_INCIDENCE: {
      title: "Pest Incidence Analysis",
      content: "This chart shows the percentage of pest problems over time. Use it to identify when pests are most active and plan preventive treatments. Lower percentages indicate better pest control."
    },
    METRICS_CARDS: {
      title: "Performance Metrics",
      content: "These cards show key performance indicators for your farm. They provide quick insights into your overall farm health and productivity. Green status indicates good performance, yellow shows areas for improvement, and red indicates issues needing attention."
    },
    AI_DATA_ANALYST: {
      title: "AI Data Analyst",
      content: "This AI-powered tool analyzes all your farm data and provides personalized insights and recommendations. It can identify patterns you might miss and suggest actionable improvements for better crop yields."
    }
  },
  
  ta: {
    MONTHLY_YIELD: {
      title: "மாதாந்திர விளைச்சல் பகுப்பாய்வு",
      content: "இந்த அட்டவணை மாதத்திற்கு மாதம் உங்கள் பயிர் விளைச்சலைக் காட்டுகிறது. பருவகால முறைகளை அடையாளம் காண, முன்னேற்றங்களை கண்காணிக்க, மற்றும் சிறந்த அறுவடை அட்டவணைகளை திட்டமிட இதைப் பயன்படுத்துங்கள். அதிக பார்கள் மிகவும் உற்பத்தி மாதங்களை குறிக்கின்றன."
    },
    SOIL_MOISTURE_TRENDS: {
      title: "மண் ஈரப்பதம் போக்குகள்",
      content: "இந்த அட்டவணை காலப்போக்கில் மண் ஈரப்பதம் அளவுகளை கண்காணிக்கிறது. இது பருவகால ஈரப்பதம் முறைகளை புரிந்துகொள்ள மற்றும் உங்கள் நீர்ப்பாசன அட்டவணையை உகந்ததாக்க உதவுகிறது. நிலையான ஈரப்பதம் அளவுகள் பொதுவாக சிறந்த பயிர் வளர்ச்சிக்கு வழிவகுக்கும்."
    },
    PEST_INCIDENCE: {
      title: "பூச்சி நிகழ்வு பகுப்பாய்வு",
      content: "இந்த அட்டவணை காலப்போக்கில் பூச்சி பிரச்சனைகளின் சதவீதத்தைக் காட்டுகிறது. பூச்சிகள் எப்போது மிகவும் செயல்படுகின்றன என்பதை அடையாளம் காண மற்றும் தடுப்பு சிகிச்சைகளை திட்டமிட இதைப் பயன்படுத்துங்கள். குறைந்த சதவீதங்கள் சிறந்த பூச்சி கட்டுப்பாட்டை குறிக்கின்றன."
    },
    METRICS_CARDS: {
      title: "செயல்திறன் அளவீடுகள்",
      content: "இந்த அட்டைகள் உங்கள் பண்ணைக்கான முக்கிய செயல்திறன் குறிகாட்டிகளைக் காட்டுகின்றன. அவை உங்கள் ஒட்டுமொத்த பண்ணை ஆரோக்கியம் மற்றும் உற்பத்தித்திறனில் விரைவான நுண்ணறிவுகளை வழங்குகின்றன. பசுமை நிலை நல்ல செயல்திறனைக் குறிக்கிறது, மஞ்சள் முன்னேற்றத்திற்கான பகுதிகளைக் காட்டுகிறது, மற்றும் சிவப்பு கவனம் தேவைப்படும் பிரச்சினைகளைக் குறிக்கிறது."
    },
    AI_DATA_ANALYST: {
      title: "AI தரவு ஆய்வாளர்",
      content: "இந்த AI-இயங்கும் கருவி உங்கள் அனைத்து பண்ணை தரவையும் பகுப்பாய்வு செய்து தனிப்பட்ட நுண்ணறிவுகள் மற்றும் பரிந்துரைகளை வழங்குகிறது. நீங்கள் தவறவிடக்கூடிய முறைகளை அடையாளம் காண மற்றும் சிறந்த பயிர் விளைச்சலுக்கு நடவடிக்கை எடுக்கக்கூடிய முன்னேற்றங்களை பரிந்துரைக்க இது முடியும்."
    }
  },
  
  si: {
    MONTHLY_YIELD: {
      title: "මාසික අස්වැන්න විශ්ලේෂණය",
      content: "මෙම ප්‍රස්ථාරය මාසයෙන් මාසයට ඔබේ භෝග අස්වැන්න පෙන්වයි. සෘතු රටා හඳුනාගැනීමට, දියුණුව නිරීක්ෂණය කිරීමට, සහ වඩා හොඳ අස්වැන්න කාලසටහන් සැලසුම් කිරීමට මෙය භාවිතා කරන්න. ඉහළ දණ්ඩ වඩා ඵලදායී මාස දක්වයි."
    },
    SOIL_MOISTURE_TRENDS: {
      title: "පාංශු තෙතමනය නැඹුරුව",
      content: "මෙම ප්‍රස්ථාරය කාලයත් සමඟ පාංශු තෙතමනය මට්ටම් නිරීක්ෂණය කරයි. එය සෘතුමය තෙතමනය රටා තේරුම් ගැනීමට සහ ඔබේ වාරිමාර්ග කාලසටහන ප්‍රශස්ත කිරීමට උපකාරී වේ. ස්ථාවර තෙතමනය මට්ටම් සාමාන්‍යයෙන් වඩා හොඳ භෝග වර්ධනයට තුඩු දෙයි."
    },
    PEST_INCIDENCE: {
      title: "සෘතු සත්ව සිදුවීම් විශ්ලේෂණය",
      content: "මෙම ප්‍රස්ථාරය කාලයත් සමඟ සෘතු සත්ව ගැටළු ප්‍රතිශතය පෙන්වයි. සෘතු සත්වයින් කවදා වඩාත් ක්‍රියාකාරීද යන්න හඳුනාගැනීමට සහ වැළැක්වීමේ ප්‍රතිකාර සැලසුම් කිරීමට එය භාවිතා කරන්න. අඩු ප්‍රතිශතයන් වඩා හොඳ සෘතු සත්ව පාලනය දක්වයි."
    },
    METRICS_CARDS: {
      title: "කාර්ය සාධන මිණුම්",
      content: "මෙම කාඩ්පත් ඔබේ ගොවිපළ සඳහා ප්‍රධාන කාර්ය සාධන දර්ශක පෙන්වයි. ඔවුන් ඔබේ සමස්ත ගොවිපළ සෞඛ්‍යය සහ ඵලදායිකත්වය පිළිබඳ ඉක්මන් අවබෝධය සපයයි. හරිත තත්ත්වය හොඳ කාර්ය සාධනය දක්වයි, කහ දියුණුවීම් සඳහා ප්‍රදේශ පෙන්වයි, සහ රතු අවධානය අවශ්‍ය ගැටළු දක්වයි."
    },
    AI_DATA_ANALYST: {
      title: "AI දත්ත විශ්ලේෂක",
      content: "මෙම AI-බලගන්වන ලද මෙවලම ඔබේ සියලුම ගොවිපළ දත්ත විශ්ලේෂණය කර පුද්ගලීකරණය කරන ලද අවබෝධය සහ නිර්දේශ සපයයි. ඔබට මග හැරෙන රටා හඳුනාගැනීමට සහ වඩා හොඳ භෝග අස්වැන්න සඳහා ක්‍රියා කළ හැකි දියුණුකිරීම් යෝජනා කිරීමට එයට හැකියාව ඇත."
    }
  }
};

// ML Models page tooltips
export const ML_MODELS_TOOLTIPS: TooltipContentByLanguage = {
  en: {
    YIELD_PREDICTION: {
      title: "Yield Prediction Model",
      content: "This AI model predicts your future crop yields based on current growing conditions, weather patterns, and historical data. Higher accuracy means more reliable predictions. Use these predictions to plan harvesting, storage, and market timing."
    },
    DISEASE_DETECTION: {
      title: "Disease Detection Model",
      content: "This AI model analyzes plant images to detect diseases early before they spread. It can identify various plant diseases and suggest treatments. Early detection saves crops and reduces losses."
    },
    CROP_RECOMMENDATION: {
      title: "Crop Recommendation Model",
      content: "This AI model will analyze your soil conditions, climate, and market prices to recommend the best crops to plant. It considers factors like profitability, growing requirements, and seasonal timing to maximize your success."
    },
    OPTIMAL_PLANTING: {
      title: "Optimal Planting Time Model",
      content: "This AI model will predict the best times to plant different crops based on weather forecasts, soil conditions, and historical data. Proper timing can significantly improve crop yields and reduce risks."
    },
    HARVESTING_TIME: {
      title: "Harvesting Time Model",
      content: "This AI model will estimate the optimal harvest time for your crops based on growth stages, weather conditions, and market prices. Harvesting at the right time ensures maximum quality and profitability."
    },
    TRAINING_HUB: {
      title: "AI Training Hub",
      content: "This section will allow you to train custom AI models using your own farm data. You can upload data, configure model parameters, and create personalized AI tools for your specific farming needs."
    }
  },
  
  ta: {
    YIELD_PREDICTION: {
      title: "விளைச்சல் கணிப்பு மாதிரி",
      content: "இந்த AI மாதிரி தற்போதைய வளர்ச்சி நிலைமைகள், வானிலை முறைகள் மற்றும் வரலாற்று தரவுகளின் அடிப்படையில் உங்கள் எதிர்கால பயிர் விளைச்சலை கணிக்கிறது. அதிக துல்லியம் என்றால் அதிக நம்பகமான கணிப்புகள். அறுவடை, சேமிப்பு மற்றும் சந்தை நேரத்தை திட்டமிட இந்த கணிப்புகளைப் பயன்படுத்துங்கள்."
    },
    DISEASE_DETECTION: {
      title: "நோய் கண்டறிதல் மாதிரி",
      content: "இந்த AI மாதிரி தாவர படங்களை பகுப்பாய்வு செய்து நோய்கள் பரவும் முன்பு ஆரம்பத்தில் கண்டறிகிறது. இது பல்வேறு தாவர நோய்களை அடையாளம் காண மற்றும் சிகிச்சைகளை பரிந்துரைக்க முடியும். ஆரம்பகால கண்டறிதல் பயிர்களை காப்பாற்றுகிறது மற்றும் இழப்புகளை குறைக்கிறது."
    },
    CROP_RECOMMENDATION: {
      title: "பயிர் பரிந்துரை மாதிரி",
      content: "இந்த AI மாதிரி உங்கள் மண் நிலைமைகள், காலநிலை மற்றும் சந்தை விலைகளை பகுப்பாய்வு செய்து நடவு செய்ய சிறந்த பயிர்களை பரிந்துரைக்கும். உங்கள் வெற்றியை அதிகரிக்க லாபம், வளர்ச்சி தேவைகள் மற்றும் பருவகால நேரம் போன்ற காரணிகளை இது கருத்தில் கொள்கிறது."
    },
    OPTIMAL_PLANTING: {
      title: "உகந்த நடவு நேர மாதிரி",
      content: "இந்த AI மாதிரி வானிலை முன்னறிவிப்புகள், மண் நிலைமைகள் மற்றும் வரலாற்று தரவுகளின் அடிப்படையில் வெவ்வேறு பயிர்களை நடவு செய்ய சிறந்த நேரங்களை கணிக்கும். சரியான நேரம் பயிர் விளைச்சலை கணிசமாக மேம்படுத்தலாம் மற்றும் அபாயங்களை குறைக்கலாம்."
    },
    HARVESTING_TIME: {
      title: "அறுவடை நேர மாதிரி",
      content: "இந்த AI மாதிரி வளர்ச்சி கட்டங்கள், வானிலை நிலைமைகள் மற்றும் சந்தை விலைகளின் அடிப்படையில் உங்கள் பயிர்களுக்கு உகந்த அறுவடை நேரத்தை மதிப்பிடும். சரியான நேரத்தில் அறுவடை செய்வது அதிகபட்ச தரம் மற்றும் லாபத்தை உறுதி செய்கிறது."
    },
    TRAINING_HUB: {
      title: "AI பயிற்சி மையம்",
      content: "இந்த பகுதி உங்கள் சொந்த பண்ணை தரவைப் பயன்படுத்தி தனிப்பயன் AI மாதிரிகளை பயிற்றுவிக்க உங்களை அனுமதிக்கும். நீங்கள் தரவை பதிவேற்றம் செய்யலாம், மாதிரி அளவுருக்களை கட்டமைக்கலாம் மற்றும் உங்கள் குறிப்பிட்ட விவசாய தேவைகளுக்கு தனிப்பயனாக்கப்பட்ட AI கருவிகளை உருவாக்கலாம்."
    }
  },
  
  si: {
    YIELD_PREDICTION: {
      title: "අස්වැන්න පුරෝකථන ආකෘතිය",
      content: "මෙම AI ආකෘතිය වත්මන් වර්ධන තත්ත්වයන්, කාලගුණ රටා, සහ ඓතිහාසික දත්ත මත පදනම්ව ඔබේ අනාගත භෝග අස්වැන්න අනාවැකි කරයි. ඉහළ නිරවද්‍යතාවය යනු වඩාත් විශ්වසනීය අනාවැකි. අස්වැන්න, ගබඩාව සහ වෙලඳපොළ කාලය සැලසුම් කිරීමට මෙම අනාවැකි භාවිතා කරන්න."
    },
    DISEASE_DETECTION: {
      title: "රෝග හඳුනාගැනීමේ ආකෘතිය",
      content: "මෙම AI ආකෘතිය ශාක පින්තූර විශ්ලේෂණය කර රෝග පැතිරීමට පෙර කලින් හඳුනා ගනී. එයට විවිධ ශාක රෝග හඳුනාගෙන ප්‍රතිකාර යෝජනා කළ හැකිය. කලින් හඳුනාගැනීම භෝග බේරා ගෙන අලාභ අඩු කරයි."
    },
    CROP_RECOMMENDATION: {
      title: "භෝග නිර්දේශ ආකෘතිය",
      content: "මෙම AI ආකෘතිය ඔබේ පාංශු තත්ත්වයන්, දේශගුණය, සහ වෙලඳපොළ මිල විශ්ලේෂණය කර රෝපණය කිරීමට හොඳම භෝග නිර්දේශ කරනු ඇත. ඔබේ සාර්ථකත්වය වැඩි කිරීම සඳහා එය ලාභදායිකත්වය, වර්ධන අවශ්‍යතා සහ සෘතුමය කාලය වැනි සාධක සලකා බලයි."
    },
    OPTIMAL_PLANTING: {
      title: "ප්‍රශස්ත රෝපණ කාල ආකෘතිය",
      content: "මෙම AI ආකෘතිය කාලගුණ අනාවැකි, පාංශු තත්ත්වයන්, සහ ඓතිහාසික දත්ත මත පදනම්ව විවිධ භෝග රෝපණය කිරීමට හොඳම කාල අනාවැකි කරනු ඇත. නිසි කාලගණනය භෝග අස්වැන්න සැලකිය යුතු ලෙස වැඩිදියුණු කර අවදානම් අඩු කළ හැකිය."
    },
    HARVESTING_TIME: {
      title: "අස්වැන්න කාල ආකෘතිය",
      content: "මෙම AI ආකෘතිය වර්ධන අදියර, කාලගුණ තත්ත්වයන්, සහ වෙලඳපොළ මිල මත පදනම්ව ඔබේ භෝග සඳහා ප්‍රශස්ත අස්වැන්න කාලය තක්සේරු කරනු ඇත. නිසි කාලයේ අස්වැන්න උපරිම ගුණාත්මකභාවය සහ ලාභදායිකත්වය සහතික කරයි."
    },
    TRAINING_HUB: {
      title: "AI පුහුණු මධ්‍යස්ථානය",
      content: "මෙම කොටස ඔබේ ම ගොවිපල දත්ත භාවිතා කර අභිරුචි AI ආකෘති පුහුණු කිරීමට ඔබට ඉඩ සැලසේ. ඔබට දත්ත උඩුගත කළ හැකිය, ආකෘති පරාමිති සකස් කළ හැකිය, සහ ඔබේ විශේෂිත ගොවිතැන් අවශ්‍යතා සඳහා පුද්ගලීකරණය කළ AI මෙවලම් සෑදිය හැකිය."
    }
  }
};

// Function to get tooltip content based on language
export function getTooltipContent(
  type: 'sensor' | 'status' | 'chart' | 'analytics' | 'ml',
  key: string,
  language: string = 'en'
): TooltipContent {
  const defaultContent = { title: key, content: "No description available." };
  
  switch (type) {
    case 'sensor':
      return SENSOR_TOOLTIPS[language]?.[key] || SENSOR_TOOLTIPS['en']?.[key] || defaultContent;
    case 'status':
      return STATUS_TOOLTIPS[language]?.[key] || STATUS_TOOLTIPS['en']?.[key] || defaultContent;
    case 'chart':
      return CHART_TOOLTIPS[language]?.[key] || CHART_TOOLTIPS['en']?.[key] || defaultContent;
    case 'analytics':
      return ANALYTICS_TOOLTIPS[language]?.[key] || ANALYTICS_TOOLTIPS['en']?.[key] || defaultContent;
    case 'ml':
      return ML_MODELS_TOOLTIPS[language]?.[key] || ML_MODELS_TOOLTIPS['en']?.[key] || defaultContent;
    default:
      return defaultContent;
  }
}

// Dashboard-specific tooltips
export const DASHBOARD_TOOLTIPS = {
  SENSOR_GRID: "This grid shows real-time readings from all your sensors. Click on any card to see detailed information and historical charts.",
  AI_ADVISOR: "The AI Farming Advisor analyzes your current sensor data and provides personalized recommendations for better crop management.",
  QUICK_ACTIONS: "These buttons provide quick access to common farming tasks and detailed sensor information."
};
