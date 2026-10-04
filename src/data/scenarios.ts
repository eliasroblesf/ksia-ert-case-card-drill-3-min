export interface TacticalOption {
  id: string;
  textEn: string;
  textAr: string;
  isCorrect: boolean;
  feedbackEn: string;
  feedbackAr: string;
}

export interface Scenario {
  id: number;
  titleEn: string;
  titleAr: string;
  locationEn: string;
  locationAr: string;
  contextEn: string;
  contextAr: string;
  threatEn: string;
  threatAr: string;
  occupancyEn: string;
  occupancyAr: string;
  constraintsEn: string;
  constraintsAr: string;
  correctLevel: 'Level 1' | 'Level 2' | 'Level 3';
  levelRationaleEn: string;
  levelRationaleAr: string;
  correctNotificationSequence: string[]; // Order of notification IDs
  tacticalOptions: TacticalOption[];
}

export const NOTIFICATION_ACTIONS = [
  { 
    id: 'report_aocc', 
    labelEn: 'Discoverer: Call Airport Operations (AOCC) with L-N-N-H details', 
    labelAr: 'المكتشف: إبلاغ مركز عمليات المطار (AOCC) ببيانات الموقع ونوع الحادث' 
  },
  { 
    id: 'report_tl', 
    labelEn: 'Discoverer: Alert ERT Team Leader immediately', 
    labelAr: 'المكتشف: تنبيه قائد فريق الاستجابة للطوارئ فوراً' 
  },
  { 
    id: 'activate_team', 
    labelEn: 'Team Leader: Sound emergency alert & activate all team roles', 
    labelAr: 'قائد الفريق: إطلاق نداء التفعيل وتوجيه مسؤولي المهام' 
  },
  { 
    id: 'evac_init', 
    labelEn: 'Evacuation Support: Guide office staff to emergency exit stairwells', 
    labelAr: 'مسؤول الإخلاء: توجيه موظفي المكاتب لسلالم الطوارئ ونقطة التجمع' 
  },
  { 
    id: 'notify_cd', 
    labelEn: 'Liaison: Call Civil Defense (998) for external backup', 
    labelAr: 'مسؤول التنسيق: استدعاء الدفاع المدني (998) للدعم الميداني' 
  },
  { 
    id: 'notify_src', 
    labelEn: 'Liaison: Call Saudi Red Crescent (997) for medical transport', 
    labelAr: 'مسؤول التنسيق: طلب إسعاف الهلال الأحمر السعودي (997)' 
  },
  { 
    id: 'coord_sec', 
    labelEn: 'Liaison: Request Security to release electronic office doors', 
    labelAr: 'مسؤول التنسيق: التنسيق مع أمن المطار لفتح بوابات الإخلاء الإلكترونية' 
  },
  { 
    id: 'util_iso', 
    labelEn: 'Team Leader / Facilities: Order remote electrical or gas shutoff', 
    labelAr: 'قائد الفريق / الصيانة: عزل وفصل التيار الكهربائي أو مصادر الطاقة' 
  },
  { 
    id: 'bls_init', 
    labelEn: 'Casualty Care: Deliver immediate first aid / CPR / AED on site', 
    labelAr: 'مسؤول الإسعاف: تقديم الإسعافات الأولية / الإنعاش القلبي ومزيل الرجفان' 
  }
];

export const scenarios: Scenario[] = [
  {
    id: 1,
    titleEn: "Finance Department Printing Room – Overheated Photocopier & Paper Fire",
    titleAr: "غرفة طباعة الإدارة المالية – اشتعال آلة تصوير وتصاعد دخان بين الأوراق",
    locationEn: "Airport Administration Building, Floor 2, Room 204 (Printing & Copy Center)",
    locationAr: "مبنى إدارة المطار، الطابق الثاني، غرفة 204 (مركز التصوير والطباعة)",
    contextEn: "A heavy-duty multi-function photocopier short-circuited and ignited nearby stacks of paper. The room is 25 square meters with a single fire-rated door.",
    contextAr: "حدوث ماس كهربائي في آلة تصوير مستندات ضخمة أدى لاشتعال أكوام الورق المجاورة. مساحة الغرفة 25 متراً مربعاً ولها باب مقاوم للحريق.",
    threatEn: "Small active flame (0.3m height) on top of the copier and paper bin. Light white-grey smoke starting to drift under the door into the open office.",
    threatAr: "لهب صغير بارتفاع 30 سم فوق آلة التصوير وسلة الورق. دخان رمادي خفيف بدأ يتسرب من أسفل الباب نحو صالة المكاتب المفتوحة.",
    occupancyEn: "One administrative assistant inhaled smoke and is coughing outside the room. 15 finance clerks working at cubicles nearby.",
    occupancyAr: "موظفة استنشقت بعض الدخان وتسعل خارج الغرفة. يتواجد 15 موظفاً في المكاتب المجاورة.",
    constraintsEn: "Photocopier is still plugged into a 220V wall socket. A portable CO2 extinguisher and an ABC dry chemical extinguisher are in the hallway.",
    constraintsAr: "آلة التصوير ما زالت متصلة بقابس الكهرباء 220 فولت. يتوفر في الممر طفاية ثاني أكسيد الكربون (CO2) وطفاية بودرة جافة (ABC).",
    correctLevel: "Level 1",
    levelRationaleEn: "Level 1 (Localized Incident): The fire is small, incipient, confined to one office room, and can be safely controlled by trained internal staff.",
    levelRationaleAr: "المستوى 1 (حادث موضعي محدود): الحريق في بدايته ومحصور في غرفة واحدة صغيرة، ويمكن احتواؤه عبر طاقم المبنى المدرّب.",
    correctNotificationSequence: ['report_tl', 'report_aocc', 'activate_team', 'evac_init', 'util_iso'],
    tacticalOptions: [
      {
        id: 't1_1',
        textEn: "Unplug power socket or switch off room circuit breaker before using extinguisher",
        textAr: "فصل القابس الكهربائي أو القاطع الفرعي للغرفة قبل البدء بالإطفاء",
        isCorrect: true,
        feedbackEn: "Correct: Eliminating the electrical feed prevents shock and reignition.",
        feedbackAr: "صحيح: قطع الكهرباء يمنع الصعق الكهربائي ويوقف استمرار الاشتعال."
      },
      {
        id: 't1_2',
        textEn: "Use the hallway CO2 extinguisher aimed at the base of the flame",
        textAr: "استخدام طفاية ثاني أكسيد الكربون (CO2) وتوجيهها نحو قاعدة اللهب",
        isCorrect: true,
        feedbackEn: "Correct: CO2 is clean and safe for office electronics without conductive hazard.",
        feedbackAr: "صحيح: غاز CO2 نظيف ومناسب للأجهزة الكهربائية دون ترك مخلفات موصلة."
      },
      {
        id: 't1_3',
        textEn: "Throw a bucket of tap water directly onto the smoking photocopier",
        textAr: "سكب سطل ماء مباشرة على آلة التصوير المشتعلة",
        isCorrect: false,
        feedbackEn: "Hazard: Water on energized electrical equipment causes lethal electric shock!",
        feedbackAr: "خطر جسيم: سكب الماء على جهاز كهربائي متصل يسبب صعقاً كهربائياً مميتاً!"
      },
      {
        id: 't1_4',
        textEn: "Move coughing assistant to fresh air and check breathing",
        textAr: "نقل الموظفة المتأثرة بالدخان للهواء النقي والتأكد من انتظام تنفسها",
        isCorrect: true,
        feedbackEn: "Correct: Prompt first-aid relocation prevents worsening smoke inhalation.",
        feedbackAr: "صحيح: إخراج المصاب بالدخان للهواء الطلق يمنع تفاقم ضيق التنفس."
      },
      {
        id: 't1_5',
        textEn: "Leave the printing room door wide open to let smoke ventilate into offices",
        textAr: "ترك باب غرفة الطباعة مفتوحاً بالكامل لتهوية الدخان نحو المكاتب",
        isCorrect: false,
        feedbackEn: "Hazard: Keeping doors open spreads smoke and toxic gases across the floor!",
        feedbackAr: "خطأ: ترك الباب مفتوحاً ينشر الدخان والغازات السامة في صالة الموظفين!"
      }
    ]
  },
  {
    id: 2,
    titleEn: "Human Resources Wing – Extension Cord Overload & Office Cubicle Fire",
    titleAr: "جناح الموارد البشرية – حمل كهربائي زائد واشتعال قواطع المكاتب المفتوحة",
    locationEn: "Airport Administration Building, Floor 3, HR Open Office Section B",
    locationAr: "مبنى إدارة المطار، الطابق الثالث، قسم الموارد البشرية (صالة ب)",
    contextEn: "Multiple electric heaters and chargers overloaded a floor power strip, igniting fabric cubicle dividers and plastic trays. Fire is spreading rapidly.",
    contextAr: "توصيل دفايات كهربائية متعددة وشواحن بقابس أرضي أدى لاشتعال القواطع القماشية وحوامل الأوراق البلاستيكية، والنار تمتد بسرعة.",
    threatEn: "Flames 1.5 meters high reaching overhead acoustic ceiling tiles. Acrid black smoke filling the 3rd floor hallway and setting off smoke detectors.",
    threatAr: "ألسنة اللهب ترتفع 1.5 متراً ووصلت للسقف المستعار. دخان أسود كثيف يملأ ممر الطابق الثالث وأجهزة الإنذار تعمل.",
    occupancyEn: "28 office workers evacuating in haste. One employee burned their hand trying to pull the burning cable.",
    occupancyAr: "28 موظفاً يخلون المكان بارتباك. أحد الموظفين أصيب بحروق في يده أثناء محاولته سحب السلك المشتعل.",
    constraintsEn: "Fire is too large for a single hand-held extinguisher. Smoke is entering the central air ducts.",
    constraintsAr: "الحجم تجاوز قدرة طفاية يدوية واحدة. الدخان بدأ يدخل مجاري التكييف المركزية.",
    correctLevel: "Level 2",
    levelRationaleEn: "Level 2 (Facility Emergency): Structural interior spread, smoke entering ventilation, casualty present, requiring floor evacuation and Civil Defense (998).",
    levelRationaleAr: "المستوى 2 (طوارئ على مستوى المبنى): الحريق انتشر في القواطع والسقف ويهدد طابقاً كاملاً ويتطلب إخلاءً وتدخلاً من الدفاع المدني.",
    correctNotificationSequence: ['report_aocc', 'report_tl', 'activate_team', 'evac_init', 'notify_cd', 'notify_src', 'util_iso'],
    tacticalOptions: [
      {
        id: 't2_1',
        textEn: "Order immediate evacuation of Floor 3 via fire exit stairs (do not use elevators)",
        textAr: "إعلان إخلاء الطابق الثالث فوراً عبر سلالم الطوارئ (عدم استخدام المصاعد)",
        isCorrect: true,
        feedbackEn: "Correct: Elevators can trap occupants or open on the fire floor.",
        feedbackAr: "صحيح: المصاعد قد تتوقف أو تفتح على طابق الحريق وتتحول لفخ قاتل."
      },
      {
        id: 't2_2',
        textEn: "Call Civil Defense (998) immediately through ERT Liaison",
        textAr: "طلب الدفاع المدني (998) فوراً عبر مسؤول التنسيق",
        isCorrect: true,
        feedbackEn: "Correct: Fire exceeds single portable extinguisher capacity.",
        feedbackAr: "صحيح: حجم الحريق والدخان تجاوز قدرة التدخل الفردي بالطفايات اليدوية."
      },
      {
        id: 't2_3',
        textEn: "Instruct employees to run back inside to collect laptop bags and personal items",
        textAr: "توجيه الموظفين للعودة إلى مكاتبهم لأخذ حقائب الحواسيب وأغراضهم الشخصية",
        isCorrect: false,
        feedbackEn: "Hazard: Never delay evacuation for personal belongings—smoke inhalation kills in minutes!",
        feedbackAr: "خطر مميت: يمنع العودة للمكاتب لجلب الأغراض الشخصية؛ الدخان يسبب الاختناق خلال دقائق!"
      },
      {
        id: 't2_4',
        textEn: "Cool burned employee hand under clean tepid running water and cover with sterile dressing",
        textAr: "تبريد يد الموظف المصاب بالماء النظيف الفاتر وتغطيتها بضمادة معقمة",
        isCorrect: true,
        feedbackEn: "Correct: Cooling relieves burn trauma; do not use ice or butter.",
        feedbackAr: "صحيح: التبريد بالماء النظيف يهدئ الحرق ويمنع تفاقم تلف الأنسجة."
      },
      {
        id: 't2_5',
        textEn: "Stay inside the smoke-filled cubicle attempting to beat the flames with office jackets",
        textAr: "البقاء داخل الصالة ومحاولة ضرب النيران بسترات العمل",
        isCorrect: false,
        feedbackEn: "Hazard: Inhaling toxic synthetic smoke causes rapid loss of consciousness.",
        feedbackAr: "خطر قاتل: استنشاق دخان المواد الصناعية يفقد الوعي سريعاً ويعرضك للموت."
      }
    ]
  },
  {
    id: 3,
    titleEn: "Administration Building Server & IT Archive – UPS Battery Failure & Gas Alarm",
    titleAr: "غرفة خوادم إدارة المطار وأرشيف تقنية المعلومات – عطل بالبطاريات وتحذير الغاز",
    locationEn: "Airport Administration Building, Floor 1, Main IT Server Vault 108",
    locationAr: "مبنى إدارة المطار، الطابق الأول، غرفة الخوادم الرئيسية 108",
    contextEn: "A rack of uninterruptible power supply (UPS) batteries suffered thermal runaway, producing dense white chemical vapors. The automated FM-200 gas system has triggered a 30-second discharge countdown.",
    contextAr: "ارتفاع حراري شديد في بطاريات التغذية الاحتياطية (UPS) أدى لتصاعد أبخرة كيميائية. نظام الإطفاء بالغاز النظيف بدأ العد التنازلي للتفريغ (30 ثانية).",
    threatEn: "Loud siren and strobe active: 'EVACUATE ROOM - GAS RELEASE IN 20 SECONDS'. Heavy chemical smell. Trapped IT technician fell and sprained ankle inside.",
    threatAr: "صفارة إنذار عالية وميض ضوئي: 'أخلِ الغرفة فوراً - سيتم تفريغ الغاز خلال 20 ثانية'. فني حاسب سقط والتوت قدمه داخل الغرفة.",
    occupancyEn: "One IT technician injured on floor inside vault. Two network staff evacuated to corridor.",
    occupancyAr: "فني مصاب في كاحله على الأرض داخل الغرفة. اثنان من زملائه خرجا إلى الممر.",
    constraintsEn: "Clean-agent gas displaces air / suppresses fire. Entering without stopping countdown risks trapping victim during gas release.",
    constraintsAr: "نظام الغاز يغلق الغرفة ويفرغ مادة الإطفاء. الدخول دون إيقاف العداد قد يؤدي للاختناق.",
    correctLevel: "Level 2",
    levelRationaleEn: "Level 2 (Facility Emergency): Threat to mission-critical IT infrastructure, trapped technician with imminent automatic fire suppression gas dump.",
    levelRationaleAr: "المستوى 2 (طوارئ المنشأة): خطر على البنية التقنية للمطار مع وجود موظف محتجز تزامناً مع تفريغ وشيك لغاز الإطفاء.",
    correctNotificationSequence: ['report_tl', 'report_aocc', 'activate_team', 'bls_init', 'notify_src', 'util_iso'],
    tacticalOptions: [
      {
        id: 't3_1',
        textEn: "Press and hold the yellow FM-200 manual ABORT button outside the door immediately",
        textAr: "الضغط المستمر فوراً على زر الإيقاف المؤقت (ABORT) لنظام الغاز بجانب الباب",
        isCorrect: true,
        feedbackEn: "Correct: Freezing the countdown protects the injured technician from being trapped in gas dump.",
        feedbackAr: "صحيح: إيقاف العد التنازلي يحمي الفني المصاب من تفريغ الغاز أثناء وجوده بالداخل."
      },
      {
        id: 't3_2',
        textEn: "Perform a rapid two-person carry to extract the technician into the fresh-air hallway",
        textAr: "تنفيذ سحب/حمل سريع بواسطة مسعفين اثنين لإخراج الفني للممر الآمن",
        isCorrect: true,
        feedbackEn: "Correct: Quick extraction under 15 seconds ensures airway safety.",
        feedbackAr: "صحيح: الإخراج السريع خلال ثوانٍ يحمي المصاب من الغازات الكيميائية."
      },
      {
        id: 't3_3',
        textEn: "Lock the server room door with the technician inside and wait outside for 20 minutes",
        textAr: "قفل باب غرفة الخوادم على الفني المصاب والانتظار بالخارج لمدة 20 دقيقة",
        isCorrect: false,
        feedbackEn: "Hazard: Abandoning an injured person inside an active hazard is gross negligence!",
        feedbackAr: "خطر جسيم: التخلي عن مصاب داخل بيئة خطرة يعرض حياته لموت محقق!"
      },
      {
        id: 't3_4',
        textEn: "Close the door once all personnel are verified clear so the system can extinguish fire",
        textAr: "إغلاق الباب بإحكام بمجرد خروج الجميع للسماح للنظام بإخماد الحريق بأمان",
        isCorrect: true,
        feedbackEn: "Correct: Releasing abort after room clearance allows clean agent to suppress fire.",
        feedbackAr: "صحيح: إغلاق الباب بعد خروج الجميع يتيح للغاز إخماد الحريق دون تعريض أحد للخطر."
      }
    ]
  },
  {
    id: 4,
    titleEn: "Administrative Staff Pantry & Kitchenette – Countertop Appliance Grease Fire",
    titleAr: "بوفيه واستراحة موظفي الإدارة – اشتعال جهاز الطهي والزيوت على سطح المطبخ",
    locationEn: "Airport Administration Building, Floor 2, Staff Pantry next to Legal Dept",
    locationAr: "مبنى إدارة المطار، الطابق الثاني، بوفيه الموظفين بجوار الإدارة القانونية",
    contextEn: "An electric cooking plate in the staff pantry was left unattended, igniting cooking oil and paper napkins on the counter.",
    contextAr: "تُركت صفيحة تسخين كهربائية دون مراقبة، مما أشعل الزيت ومناديل ورقية على منضدة المطبخ.",
    threatEn: "Flames 0.8 meters high on the counter, spreading toward upper wooden pantry cabinets. Heavy cooking smoke.",
    threatAr: "ألسنة لهب بارتفاع 80 سم على المنضدة وتمتد نحو الخزائن الخشبية العلوية، مع دخان زيت كثيف.",
    occupancyEn: "Pantry worker panicked and ran out. 12 legal specialists in adjacent offices smell smoke.",
    occupancyAr: "عامل البوفيه أصيب بالذعر وخرج راكضاً. 12 موظفاً في المكاتب المجاورة يشمون رائحة الحريق.",
    constraintsEn: "Water must never be thrown on hot burning oil. A fire blanket and Wet Chemical / Foam extinguisher are mounted near door.",
    constraintsAr: "يحظر تماماً سكب الماء على الزيت المشتعل. تتوفر بطانية حريق وطفاية خاصة بالمطابخ بجانب الباب.",
    correctLevel: "Level 1",
    levelRationaleEn: "Level 1 (Localized Incident): Incipient grease/appliance fire in a small pantry, easily contained with a fire blanket or wet chemical extinguisher.",
    levelRationaleAr: "المستوى 1 (حادث موضعي محدود): حريق زيوت في مرحلته الأولية داخل بوفيه صغير، يمكن إخماده ببطانية الحريق أو الطفاية المناسبة.",
    correctNotificationSequence: ['report_tl', 'report_aocc', 'activate_team', 'evac_init', 'util_iso'],
    tacticalOptions: [
      {
        id: 't4_1',
        textEn: "Cover the burning pan carefully with the fire blanket or metal lid to starve it of oxygen",
        textAr: "تغطية وعاء الزيت المشتعل بحذر باستخدام بطانية الحريق أو غطاء معدني لعزل الأكسجين",
        isCorrect: true,
        feedbackEn: "Correct: Smothering is the safest method for cooking oil fires.",
        feedbackAr: "صحيح: كتم النيران ببطانية الحريق هو الأسلوب الأسلم لإخماد حرائق الزيوت."
      },
      {
        id: 't4_2',
        textEn: "Turn off electrical power to the kitchenette appliance",
        textAr: "فصل التيار الكهربائي عن جهاز الطهي بالبوفيه",
        isCorrect: true,
        feedbackEn: "Correct: Removing the heat source stops the fire cycle.",
        feedbackAr: "صحيح: فصل مصدر الحرارة يمنع استمرار اشتعال الزيت."
      },
      {
        id: 't4_3',
        textEn: "Throw a glass of cold water directly into the boiling burning oil",
        textAr: "سكب كوب ماء بارد مباشرة فوق الزيت المغلي المشتعل",
        isCorrect: false,
        feedbackEn: "Hazard: Water creates an explosive fireball steam explosion that causes catastrophic burns!",
        feedbackAr: "كارثة: سكب الماء على الزيت المغلي يسبب انفجاراً نارياً ضخماً وحروقاً بالغة!"
      },
      {
        id: 't4_4',
        textEn: "Notify adjacent legal office staff to step into corridor as a precaution",
        textAr: "إبلاغ موظفي المكاتب المجاورة بالخروج الاحترازي إلى الممر",
        isCorrect: true,
        feedbackEn: "Correct: Controlled precautionary evacuation keeps corridors clear.",
        feedbackAr: "صحيح: الإجراء الاحترازي يضمن سلامة الموظفين حتى زوال الدخان."
      }
    ]
  },
  {
    id: 5,
    titleEn: "Administration Janitorial Storage – Accidental Chemical Reaction & Toxic Vapor",
    titleAr: "مستودع نظافة مبنى الإدارة – تفاعل كيميائي عرضي وتصاعد أبخرة سامة",
    locationEn: "Airport Administration Building, Ground Floor, Service Room G-12",
    locationAr: "مبنى إدارة المطار، الطابق الأرضي، غرفة الخدمات G-12",
    contextEn: "A cleaning worker accidentally mixed concentrated ammonia and chlorine bleach while refilling floor scrubbing containers. A rapid chemical reaction produced toxic chloramine gas.",
    contextAr: "قام عامل نظافة بخلط مادة الكلور مع الأمونيا بالخطأ أثناء تعبئة عبوات التنظيف، مما أدى لانبعاث غاز الكلورامين السام الخانق.",
    threatEn: "Pungent, choking yellowish vapor cloud spreading from the room into the hallway. Burning eyes, violent coughing, and nausea.",
    threatAr: "سحابة أبخرة صفراء خانقة برائحة لاذعة تنتشر نحو الممر، مسببة حروقاً في العين وسعالاً شديداً وغثياناً.",
    occupancyEn: "The cleaner is dizzy and vomiting outside the room. 10 customer service office staff in the adjacent wing.",
    occupancyAr: "عامل النظافة يعاني من دوخة وتقيؤ خارج الغرفة. يتواجد 10 موظفين في قسم خدمة العملاء المجاور.",
    constraintsEn: "No fire or flames, but toxic inhalation hazard. Regular dust masks provide zero protection against chemical vapors.",
    constraintsAr: "لا يوجد حريق لكن هناك خطر استنشاق سام. الكمامات الورقية العادية لا تحمي من الأبخرة الكيميائية.",
    correctLevel: "Level 2",
    levelRationaleEn: "Level 2 (Facility Emergency): Hazardous chemical gas release spreading into administrative spaces, requiring zone isolation, medical triage, and Civil Defense Hazmat support.",
    levelRationaleAr: "المستوى 2 (طوارئ المنشأة): انبعاث غازات كيميائية سامة تهدد صحة الموظفين، وتتطلب عزلاً للمنطقة وتدخلاً طبياً ودفاعاً مدنياً.",
    correctNotificationSequence: ['report_aocc', 'report_tl', 'activate_team', 'evac_init', 'notify_cd', 'notify_src'],
    tacticalOptions: [
      {
        id: 't5_1',
        textEn: "Seal the janitorial room door firmly to contain the gas cloud inside",
        textAr: "إغلاق باب غرفة النظافة بإحكام لحصر الأبخرة السامة بالداخل",
        isCorrect: true,
        feedbackEn: "Correct: Closing doors contains the vapor and protects adjacent hallways.",
        feedbackAr: "صحيح: إغلاق الباب يمنع انتشار الغاز الخانق في ممرات المبنى."
      },
      {
        id: 't5_2',
        textEn: "Evacuate the Ground Floor administrative wing to the outdoor assembly point upwind",
        textAr: "إخلاء جناح المكاتب بالطابق الأرضي نحو نقطة التجمع الخارجية في اتجاه معاكس للريح",
        isCorrect: true,
        feedbackEn: "Correct: Upwind outdoor evacuation prevents breathing contaminated air.",
        feedbackAr: "صحيح: التجمع عكس اتجاه الرياح يضمن تنفس هواء نقي وخالٍ من الغازات."
      },
      {
        id: 't5_3',
        textEn: "Send an untrained clerk inside without breathing gear to clean up the spill with paper towels",
        textAr: "إرسال موظف بدون أجهزة تنفس لداخل الغرفة لتنشيف السائل المسكوب بالمحارم",
        isCorrect: false,
        feedbackEn: "Hazard: Entering a toxic vapor environment without self-contained breathing apparatus causes acute lung injury or asphyxiation!",
        feedbackAr: "خطر قاتل: الدخول في أبخرة سامة بدون جهاز تنفس يسبب تلف الرئتين وفقدان الوعي الفوري!"
      },
      {
        id: 't5_4',
        textEn: "Provide fresh air, eye wash, and call Red Crescent (997) for the exposed cleaner",
        textAr: "نقل العامل المصاب للهواء النقي وغسل عينيه بالماء وطلب الهلال الأحمر (997)",
        isCorrect: true,
        feedbackEn: "Correct: Rapid decontamination and medical assessment are essential.",
        feedbackAr: "صحيح: الغسيل الفوري بالماء النقي واستدعاء الإسعاف ضروري لعلاج حروق الغاز."
      }
    ]
  },
  {
    id: 6,
    titleEn: "Executive Boardroom – Sudden Medical Collapse & Cardiac Arrest",
    titleAr: "قاعة الاجتماعات الرئيسية – حالة إغماء مفاجئ وتوقف عضلة القلب",
    locationEn: "Airport Administration Building, Floor 4, Executive Boardroom 401",
    locationAr: "مبنى إدارة المطار، الطابق الرابع، قاعة اجتماعات الإدارة التنفيذية 401",
    contextEn: "During a management briefing, a 54-year-old department director suddenly collapsed from their chair onto the floor. The casualty is motionless.",
    contextAr: "أثناء عرض تدريبي، سقط أحد مديري الإدارات (54 عاماً) فجأة من كرسيه على الأرض وفقد الوعي تماماً دون حراك.",
    threatEn: "Casualty is completely unresponsive to loud voice and shoulder tap. No normal breathing observed (only infrequent agonal gasps). No pulse check delay.",
    threatAr: "المصاب فاقد للوعي تماماً ولا يستجيب للصوت أو الهز. لا يوجد تنفس طبيعي (فقط حركات تنفس احتضارية متقطعة).",
    occupancyEn: "8 executive managers in room, visibly panicked and shouting. No external fire or physical hazard.",
    occupancyAr: "8 من قيادات المطار في القاعة، في حالة ذعر وصراخ. لا يوجد حريق أو خطر بيئي.",
    constraintsEn: "Every minute of delay in CPR and defibrillation reduces survival odds by 10%. An AED is mounted in Floor 4 lobby 20 meters away.",
    constraintsAr: "كل دقيقة تأخير في الإنعاش وجهاز الصدمات تقلل فرص النجاة بنسبة 10%. يتوفر جهاز (AED) في بهو الطابق على بعد 20 متراً.",
    correctLevel: "Level 1",
    levelRationaleEn: "Level 1 (Localized Medical Emergency): Critical life-saving event requiring immediate internal CPR/AED deployment and Red Crescent (997) dispatch.",
    levelRationaleAr: "المستوى 1 (طوارئ طبية موضعية حرجة): حالة توقف قلب تتطلب تفعيلاً فورياً للإنعاش القلبي وجهاز الصدمات واستدعاء الإسعاف 997.",
    correctNotificationSequence: ['report_tl', 'report_aocc', 'bls_init', 'notify_src', 'activate_team'],
    tacticalOptions: [
      {
        id: 't6_1',
        textEn: "Immediately verify unresponsiveness, call for the lobby AED, and start chest compressions (100-120 bpm, 5-6 cm depth)",
        textAr: "التحقق الفوري من عدم الاستجابة، طلب جهاز الصدمات (AED)، والبدء بالضغطات الصدرية (100-120 ضغطة/دقيقة)",
        isCorrect: true,
        feedbackEn: "Correct: Immediate high-quality chest compressions maintain vital blood flow to the brain.",
        feedbackAr: "صحيح: الضغطات الصدرية الفورية هي الركيزة الأساسية لضخ الدم للدماغ والقلب."
      },
      {
        id: 't6_2',
        textEn: "Direct a specific colleague: 'You in the blue suit, call Red Crescent 997 now and guide them to Floor 4'",
        textAr: "توجيه أمر محدد لأحد الحاضرين: 'أنت بالبدلة الزرقاء، اتصل بالهلال الأحمر 997 واستقبل المسعفين'",
        isCorrect: true,
        feedbackEn: "Correct: Directive bystander tasking cuts through crowd panic.",
        feedbackAr: "صحيح: توجيه شخص بعينه يلغي تشتت الحضور ويضمن سرعة طلب الإسعاف."
      },
      {
        id: 't6_3',
        textEn: "Waste 3 minutes searching for a wrist pulse while leaving the victim flat with no chest compressions",
        textAr: "إضاعة 3 دقائق في محاولة تحسس نبض المعصم دون إجراء أي إنعاش قلبي",
        isCorrect: false,
        feedbackEn: "Hazard: Modern guidelines strictly forbid delaying CPR for unreliable pulse checks on unresponsive non-breathing victims!",
        feedbackAr: "خطأ فادح: البروتوكولات الحديثة تحظر إضاعة الوقت في فحص النبض عند فقدان الوعي وتوقف التنفس الطبيعي!"
      },
      {
        id: 't6_4',
        textEn: "Turn on AED as soon as it arrives, attach pads to bare chest, and follow voice prompts to deliver shock if advised",
        textAr: "تشغيل جهاز (AED) فور وصوله، تثبيت اللصقات على الصدر العاري، واتباع التعليمات الصوتية للصعق",
        isCorrect: true,
        feedbackEn: "Correct: Early defibrillation within 3 minutes gives the highest survival probability.",
        feedbackAr: "صحيح: استخدام جهاز مزيل الرجفان في أول 3 دقائق يوفر أعلى نسبة نجاة ممكنة."
      }
    ]
  },
  {
    id: 7,
    titleEn: "Ground Floor Administration Lobby – Unattended Suspicious Bag & Burning Smell",
    titleAr: "بهو استقبال مبنى الإدارة – حقيبة مجهولة مشبوهة ورائحة احتراق أسلاك",
    locationEn: "Airport Administration Building, Main Public Reception & Security Turnstiles",
    locationAr: "مبنى إدارة المطار، صالة الاستقبال الرئيسية وبوابات التفتيش",
    contextEn: "A large black backpack with external wiring protruding was discovered tucked behind a visitor bench next to the turnstiles, accompanied by a faint smell of hot electrical insulation.",
    contextAr: "تم العثور على حقيبة ظهر سوداء كبيرة يبرز منها سلك مع شاشة صغيرة خلف مقاعد الزوار قرب بوابات الدخول، مع انبعاث رائحة خفيفة لاحتراق أسلاك.",
    threatEn: "Potential security threat (improvised device) overlapping with potential electrical fire hazard. Smoke detector alert on reception panel.",
    threatAr: "اشتباه أمني بجسم غريب متزامن مع خطر حريق كهربائي محتمل. جهاز إنذار الدخان في الصالة أصدر تنبيهاً.",
    occupancyEn: "35 visitors and administrative receptionists in the lobby area. People beginning to crowd around curiously.",
    occupancyAr: "35 شخصاً من الزوار وموظفي الاستقبال في البهو، وبدأ البعض بالتجمع والاقتراب بدافع الفضول.",
    constraintsEn: "Aviation security regulations strictly prohibit handling, moving, or opening suspicious packages under any circumstances.",
    constraintsAr: "أنظمة أمن الطيران تمنع منعاً باتاً لمس أو تحريك أو فتح الأجسام المشبوهة تحت أي ظرف.",
    correctLevel: "Level 2",
    levelRationaleEn: "Level 2 (Dual Security-Safety Emergency): Combination of potential explosive device and fire hazard requiring perimeter evacuation, police EOD, and Civil Defense staging.",
    levelRationaleAr: "المستوى 2 (طوارئ أمنية وسلامة مشتركة): تزامن اشتباه أمني مع خطر حريق يستدعي إخلاءً فورياً للمنطقة واستدعاء خبراء المتفجرات والدفاع المدني.",
    correctNotificationSequence: ['report_aocc', 'report_tl', 'coord_sec', 'activate_team', 'evac_init', 'notify_cd'],
    tacticalOptions: [
      {
        id: 't7_1',
        textEn: "Strictly prohibit anyone from touching, moving, or inspecting the bag",
        textAr: "منع أي شخص قطعياً من لمس الحقيبة أو تحريكها أو فحص ما بداخلها",
        isCorrect: true,
        feedbackEn: "Correct: Never interfere with unverified suspicious packages.",
        feedbackAr: "صحيح: حظر لمس الحقائب المشبوهة قاعدة أمنية قطعية لحماية الأرواح."
      },
      {
        id: 't7_2',
        textEn: "Order immediate calm evacuation of the lobby to at least 100 meters standoff distance",
        textAr: "إخلاء بهو الاستقبال فوراً بهدوء إلى مسافة أمان لا تقل عن 100 متر خارج المبنى",
        isCorrect: true,
        feedbackEn: "Correct: Establishing a 100-meter safety perimeter protects from blast or shrapnel.",
        feedbackAr: "صحيح: تطبيق طوق أمان بمحيط 100 متر يحمي من آثار أي انفجار أو شظايا."
      },
      {
        id: 't7_3',
        textEn: "Pick up the backpack and carry it to the administrative breakroom to see what is inside",
        textAr: "حمل الحقيبة وأخذها إلى غرفة الاستراحة لفتحها ومعرفة محتواها",
        isCorrect: false,
        feedbackEn: "Hazard: Catastrophic violation of explosive safety protocols—can trigger immediate blast!",
        feedbackAr: "كارثة أمنية: تحريك الجسم المشبوه قد يفجر العبوة فوراً ويوقع وفيات متعددة!"
      },
      {
        id: 't7_4',
        textEn: "Notify Airport Security & Police EOD and Civil Defense concurrently via ERT Liaison",
        textAr: "إبلاغ أمن المطار ووحدة إبطال المتفجرات والدفاع المدني فوراً عبر مسؤول التنسيق",
        isCorrect: true,
        feedbackEn: "Correct: Dual notification ensures simultaneous bomb disposal and fire response.",
        feedbackAr: "صحيح: التنسيق المشترك مع الأمن والدفاع المدني يضمن التعامل التخصصي مع الموقف."
      }
    ]
  },
  {
    id: 8,
    titleEn: "Administration Records Archive – Plumbing Pipe Rupture over Distribution Panel",
    titleAr: "أرشيف ملفات إدارة المطار – انفجار أنبوب مياه فوق لوحة توزيع الكهرباء",
    locationEn: "Airport Administration Building, Basement B1, Records Storage & Electrical Annex",
    locationAr: "مبنى إدارة المطار، قبو B1، مستودع الأرشيف والملفات ولوحة التوزيع",
    contextEn: "A pressurized water supply pipe burst in the ceiling directly above the sub-distribution electrical panel. Water is cascading over energized 400V circuit breakers with loud arcing sparks.",
    contextAr: "انفجر أنبوب مياه مضغوط في السقف مباشرة فوق لوحة التوزيع الكهربائية الفرعية، والمياه تتدفق فوق قواطع 400 فولت مع شرر كهربائي متطاير.",
    threatEn: "Violent sparks and popping sounds. Water puddle is 3 cm deep across the floor and conducting stray voltage. An archive clerk is stranded on a wooden platform.",
    threatAr: "تطاير شرر كهربائي وفرقعة مستمرة. المياه تغمر الأرضية بارتفاع 3 سم مع خطر سريان تيار كهربائي، وموظف الأرشيف محاصر فوق منصة خشبية.",
    occupancyEn: "One clerk trapped in aisle. 4 facilities technicians in adjoining basement workshop.",
    occupancyAr: "موظف أرشيف محاصر في الممر، و4 فنيين في ورشة الصيانة المجاورة بالقبو.",
    constraintsEn: "Rescuers stepping into the water puddle risk fatal electrocution. Main building breaker must be isolated upstream.",
    constraintsAr: "الدخول في بركة الماء يعرض المسعف لصعق كهربائي مميت. يلزم فصل القاطع الرئيسي المغذي من المصدر.",
    correctLevel: "Level 2",
    levelRationaleEn: "Level 2 (Facility Emergency): High-voltage energized electrical hazard combined with flooding in a confined basement, requiring immediate utility isolation and technician rescue.",
    levelRationaleAr: "المستوى 2 (طوارئ المنشأة): خطر كهربائي عالي الجهد متزامن مع تدفق مياه بالقبو يهدد حياة الموظف ويتطلب فصلاً فورياً للكهرباء.",
    correctNotificationSequence: ['report_tl', 'report_aocc', 'util_iso', 'activate_team', 'evac_init'],
    tacticalOptions: [
      {
        id: 't8_1',
        textEn: "Order immediate remote trip / lockout of the upstream electrical feed at Main Substation",
        textAr: "طلب فصل التيار الكهربائي الرئيسي المغذي للقبو فوراً من المحطة الرئيسية",
        isCorrect: true,
        feedbackEn: "Correct: Isolating power eliminates the lethal shock hazard before water entry.",
        feedbackAr: "صحيح: فصل الكهرباء من المصدر يزيل خطر الصعق تماماً قبل التقدم لإنقاذ الموظف."
      },
      {
        id: 't8_2',
        textEn: "Warn the stranded clerk to remain completely still on the dry wooden platform until power is dead",
        textAr: "توجيه الموظف المحاصر بالبقاء ثابتاً فوق المنصة الخشبية الجافة حتى تأكيد قطع الكهرباء",
        isCorrect: true,
        feedbackEn: "Correct: Wood provides insulation; stepping into electrified water is lethal.",
        feedbackAr: "صحيح: الخشب عازل، ونزوله في الماء المكهرب يعرضه لصعقة قاتلة."
      },
      {
        id: 't8_3',
        textEn: "Rush through the flooded electrified water barefoot to grab the electrical panel door",
        textAr: "الركض حافي القدمين وسط الماء المكهرب للإمساك بباب لوحة الكهرباء",
        isCorrect: false,
        feedbackEn: "Hazard: Lethal electrocution! Never enter standing water with active electrical arcing.",
        feedbackAr: "كارثة مميتة: الصعق الكهربائي المباشر في الماء يؤدي للوفاة الفورية!"
      },
      {
        id: 't8_4',
        textEn: "Close the basement main water isolation valve to halt water flooding",
        textAr: "إغلاق محبس المياه الرئيسي المغذي للقبو لوقف تدفق المياه",
        isCorrect: true,
        feedbackEn: "Correct: Stopping the water leak prevents further structural damage.",
        feedbackAr: "صحيح: عزل خط المياه يوقف تراكم السيول بالقبو ويحد من الأضرار."
      }
    ]
  },
  {
    id: 9,
    titleEn: "Administration Central Complex – Vertical Utility Shaft Fire & Multi-Floor Smoke Trap",
    titleAr: "مجمع إدارة المطار الرئيسي – حريق في مسار الكابلات وتصاعد الدخان في السلالم",
    locationEn: "Airport Administration 5-Story Tower, Central Electrical Riser Shaft & Stairwell B",
    locationAr: "برج إدارة المطار المكون من 5 طوابق، مسار الكابلات الرئيسي ودرج الطوارئ (ب)",
    contextEn: "A major electrical cable bundle ignited inside the vertical utility shaft between Floor 1 and Floor 2. Dense toxic smoke has banked down into Stairwell B, disabling the primary escape route.",
    contextAr: "اشتعال حزمة كابلات رئيسية داخل المسار الرأسي بين الطابقين الأول والثاني، وتصاعد دخان أسود كثيف حاصر درج الطوارئ الرئيسي (ب).",
    threatEn: "Heavy carbon monoxide and plastic smoke spreading into Floors 3, 4, and 5. Elevators recalled and locked. Multiple staff coughing at windows.",
    threatAr: "غاز أول أكسيد الكربون ودخان البلاستيك ينتشر في الطوابق 3 و4 و5. المصاعد توقفت، وموظفون يتجمعون عند النوافذ يستغيثون.",
    occupancyEn: "Over 120 administrative employees across upper floors. 3 staff reporting severe respiratory distress.",
    occupancyAr: "أكثر من 120 موظفاً في الطوابق العليا، مع إبلاغ 3 موظفين عن صعوبة بالغة في التنفس واختناق.",
    constraintsEn: "Stairwell B is impassable due to zero visibility smoke. Egress must be redirected to alternate Stairwell A. Full multi-agency response required.",
    constraintsAr: "درج (ب) مسدود بالكامل بدخان كثيف منعدم الرؤية. يجب تحويل الإخلاء لدرج (أ) البديل واستدعاء فرق الدفاع المدني.",
    correctLevel: "Level 3",
    levelRationaleEn: "Level 3 (Major Aerodrome Disaster / Complex Structure Fire): Multi-floor building fire, trapped occupants, smoke compromise of primary exits, requiring full Civil Defense (998) and Red Crescent MCI dispatch.",
    levelRationaleAr: "المستوى 3 (حادث طوارئ كبير على مستوى المنشأة): حريق متعدد الطوابق مع حصار موظفين وانسداد مخرج رئيسي يستدعي تدخلاً شاملاً للدفاع المدني والإسعاف.",
    correctNotificationSequence: ['report_aocc', 'report_tl', 'activate_team', 'notify_cd', 'notify_src', 'evac_init', 'coord_sec'],
    tacticalOptions: [
      {
        id: 't9_1',
        textEn: "Seal doors to smoke-filled Stairwell B and redirect all floor occupants to pressurized Stairwell A",
        textAr: "إغلاق أبواب درج (ب) الممتلئ بالدخان وتحويل مسار الموظفين فوراً إلى درج (أ) البديل",
        isCorrect: true,
        feedbackEn: "Correct: Intercepting exit fixation and using clear secondary stairs saves lives.",
        feedbackAr: "صحيح: منع الموظفين من دخول الدرج الممتلئ بالدخان وتوجيههم للمخرج الآمن ينقذ الأرواح."
      },
      {
        id: 't9_2',
        textEn: "Declare Level 3 and request multi-company Civil Defense ladder trucks and Red Crescent triage buses",
        textAr: "إعلان المستوى 3 واستدعاء آليات الدفاع المدني وسلالم الإنقاذ وسيارات إسعاف متعددة",
        isCorrect: true,
        feedbackEn: "Correct: Incident exceeds internal ERT capacity; external heavy rescue is mandatory.",
        feedbackAr: "صحيح: حجم الحادث يتجاوز إمكانيات الفريق الداخلي ويتطلب آليات إنقاذ متطورة."
      },
      {
        id: 't9_3',
        textEn: "Tell trapped workers on Floor 4 to jump out of high windows onto concrete",
        textAr: "إبلاغ الموظفين المحاصرين في الطابق الرابع بالقفز من النوافذ على الأرضيات الأسمنتية",
        isCorrect: false,
        feedbackEn: "Hazard: Jumping from upper stories results in fatal falls; instruct them to shelter in place near closed doors until rescue arrives.",
        feedbackAr: "خطر كارثي: القفز من الطوابق العليا يسبب وفيات فورية؛ يجب التوجيه بالاحتماء بغرف مغلقة حتى وصول السلالم."
      },
      {
        id: 't9_4',
        textEn: "Coordinate with Building Automation to switch HVAC ventilation to emergency smoke extraction mode",
        textAr: "التنسيق مع غرفة التحكم لتحويل نظام التكييف لوضع سحب الدخان وطرده للخارج",
        isCorrect: true,
        feedbackEn: "Correct: Smoke extraction reduces toxic gas pressure in escape paths.",
        feedbackAr: "صحيح: تشغيل مراوح شفط الدخان يقلل تركيز الغازات السامة في ممرات الهروب."
      }
    ]
  },
  {
    id: 10,
    titleEn: "Procurement Office Renovation – Fallen Glass Partition & Severe Bleeding Trauma",
    titleAr: "مكاتب المشتريات والعقود – سقوط لوح زجاجي وإصابة بنزيف شرياني حاد",
    locationEn: "Airport Administration Building, Floor 3, Procurement Department Suite 315",
    locationAr: "مبنى إدارة المطار، الطابق الثالث، مكاتب إدارة المشتريات جناح 315",
    contextEn: "During office layout remodeling, a heavy 2.5-meter architectural tempered glass panel slipped from a cart and shattered, striking a contract officer.",
    contextAr: "أثناء إعادة ترتيب المكاتب، انزلق لوح زجاجي كبير وسقط على الأرض متناثراً، مما أصاب أحد موظفي العقود بجرح عميق.",
    threatEn: "Deep spurting arterial laceration across the forearm with heavy pulsatile dark-red blood loss. Victim is conscious, extremely pale, dizzy, sweating (early shock).",
    threatAr: "جرح قطعي غائر في الساعد مع نزف دموي متدفق بغزارة. المصاب شاحب جداً ويتصبب عرقاً ويعاني من دوار (بداية صدمة).",
    occupancyEn: "8 coworkers in office in distress, some offering tissues that are instantly soaked through.",
    occupancyAr: "8 زملاء في المكتب في حالة قلق شديد، والمناديل المستخدمة تمتلئ بالدماء خلال ثوانٍ.",
    constraintsEn: "Arterial bleeding can cause fatal exsanguination within 3 minutes without continuous direct pressure or tourniquet. No active fire.",
    constraintsAr: "النزيف الشرياني الحاد يسبب الوفاة خلال 3 دقائق إذا لم يتم إيقافه بالضغط المباشر المستمر أو العاصبة.",
    correctLevel: "Level 1",
    levelRationaleEn: "Level 1 (Localized Severe Medical Trauma): High-acuity trauma event requiring immediate tactical bleeding control and emergency ambulance transport (997).",
    levelRationaleAr: "المستوى 1 (طوارئ طبية موضعية حادة): إصابة نزيف حاد تستدعي تدخلاً إسعافياً عاجلاً للسيطرة على النزف وطلب الهلال الأحمر.",
    correctNotificationSequence: ['report_tl', 'bls_init', 'notify_src', 'report_aocc'],
    tacticalOptions: [
      {
        id: 't10_1',
        textEn: "Apply firm, continuous direct mechanical pressure squarely over the wound using sterile trauma pads",
        textAr: "تطبيق ضغط ميكانيكي مباشر وقوي ومستمر فوق الجرح بواسطة ضمادات معقمة",
        isCorrect: true,
        feedbackEn: "Correct: Direct pressure is the fastest and most effective way to arrest life-threatening hemorrhage.",
        feedbackAr: "صحيح: الضغط المباشر المستمر هو الإجراء الأهم والأسرع لوقف النزيف الحاد وإنقاذ الحياة."
      },
      {
        id: 't10_2',
        textEn: "Periodically lift the dressing every 15 seconds to look and see if the bleeding has stopped",
        textAr: "رفع الضمادة كل 15 ثانية للتأكد ما إذا كان النزيف قد توقف أم لا",
        isCorrect: false,
        feedbackEn: "Hazard: Lifting pressure breaks the fragile initial blood clot and restarts catastrophic bleeding!",
        feedbackAr: "خطأ طبي فادح: رفع الضغط يمزق التخثر المتكون ويعيد النزيف الحاد من جديد!"
      },
      {
        id: 't10_3',
        textEn: "Lay casualty flat, elevate legs 20-30 cm, and cover with a thermal blanket to combat shock",
        textAr: "تمديد المصاب على ظهره ورفع قدميه 20-30 سم وتغطيته بغطاء حراري لعلاج الصدمة",
        isCorrect: true,
        feedbackEn: "Correct: Shock positioning maintains blood perfusion to heart and brain.",
        feedbackAr: "صحيح: وضعية الصدمة مع التدفئة تحافظ على تدفق الدم إلى الأعضاء الحيوية."
      },
      {
        id: 't10_4',
        textEn: "Call Red Crescent (997) and dispatch an ERT guide to meet the ambulance at Gate 2",
        textAr: "الاتصال بالهلال الأحمر (997) وإرسال مرشد لاستقبال سيارة الإسعاف عند بوابة المبنى 2",
        isCorrect: true,
        feedbackEn: "Correct: Guided arrival prevents emergency vehicles getting delayed at airport checkpoints.",
        feedbackAr: "صحيح: إرشاد طاقم الإسعاف يختصر وقت الوصول ويمنع تأخرهم عند بوابات الدخول."
      }
    ]
  }
];
