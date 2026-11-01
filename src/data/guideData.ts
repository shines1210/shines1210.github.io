export interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  recommended: boolean;
}

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  // 證件
  { id: 'doc-1', category: '證件', text: '護照 X4', recommended: true },
  { id: 'doc-2', category: '證件', text: '電子機票', recommended: true },
  { id: 'doc-3', category: '證件', text: '外幣', recommended: true },
  { id: 'doc-4', category: '證件', text: '健保卡', recommended: true },
  { id: 'doc-5', category: '證件', text: '網卡', recommended: true },
  { id: 'doc-6', category: '證件', text: '信用卡', recommended: true },
  { id: 'doc-7', category: '證件', text: '台幣', recommended: true },
  { id: 'doc-8', category: '證件', text: '駕照正本', recommended: true },
  { id: 'doc-9', category: '證件', text: '日譯本駕照', recommended: true },
  { id: 'doc-10', category: '證件', text: '日幣現金', recommended: true },
  { id: 'doc-11', category: '證件', text: '家裡鑰匙', recommended: true },

  // 電子用品
  { id: 'elec-1', category: '電子用品', text: '手機', recommended: true },
  { id: 'elec-2', category: '電子用品', text: '充電線', recommended: true },
  { id: 'elec-3', category: '電子用品', text: '轉接頭', recommended: true },
  { id: 'elec-4', category: '電子用品', text: '延長線', recommended: true },
  { id: 'elec-5', category: '電子用品', text: '自拍棒', recommended: false },
  { id: 'elec-6', category: '電子用品', text: '腳架', recommended: false },
  { id: 'elec-7', category: '電子用品', text: '車用手機架', recommended: true },
  { id: 'elec-8', category: '電子用品', text: '行動電源', recommended: true },
  { id: 'elec-9', category: '電子用品', text: '旅行電水壺、鍋', recommended: false },

  // 日用品
  { id: 'daily-1', category: '日用品', text: '眼鏡', recommended: true },
  { id: 'daily-2', category: '日用品', text: '隱形眼鏡、藥水', recommended: true },
  { id: 'daily-3', category: '日用品', text: '頸枕', recommended: false },
  { id: 'daily-4', category: '日用品', text: '文具用品', recommended: false },
  { id: 'daily-5', category: '日用品', text: '指甲剪、小剪刀', recommended: true },
  { id: 'daily-6', category: '日用品', text: '面紙', recommended: true },
  { id: 'daily-7', category: '日用品', text: '保溫瓶', recommended: true },
  { id: 'daily-8', category: '日用品', text: '暖暖包', recommended: true },

  // 盥洗用品
  { id: 'wash-1', category: '盥洗用品', text: '洗面乳', recommended: true },
  { id: 'wash-2', category: '盥洗用品', text: '潤髮乳、護髮霜', recommended: true },
  { id: 'wash-3', category: '盥洗用品', text: '牙刷、牙膏', recommended: true },
  { id: 'wash-4', category: '盥洗用品', text: '梳子', recommended: true },
  { id: 'wash-5', category: '盥洗用品', text: '髮圈', recommended: true },

  // 衣物
  { id: 'cloth-1', category: '衣物', text: '上衣 ( )件', recommended: true },
  { id: 'cloth-2', category: '衣物', text: '褲子 ( )件', recommended: true },
  { id: 'cloth-3', category: '衣物', text: '裙子 ( )件', recommended: false },
  { id: 'cloth-4', category: '衣物', text: '內衣褲 ( )件', recommended: true },
  { id: 'cloth-5', category: '衣物', text: '睡衣', recommended: true },
  { id: 'cloth-6', category: '衣物', text: '鞋子 ( )雙', recommended: true },
  { id: 'cloth-7', category: '衣物', text: '襪子 ( )雙', recommended: true },
  { id: 'cloth-8', category: '衣物', text: '帽子', recommended: true },
  { id: 'cloth-9', category: '衣物', text: '圍巾', recommended: true },
  { id: 'cloth-10', category: '衣物', text: '手套', recommended: true },
  { id: 'cloth-11', category: '衣物', text: '發熱衣', recommended: true },
  { id: 'cloth-12', category: '衣物', text: '泳衣', recommended: false },

  // 保養品
  { id: 'care-1', category: '保養品', text: '化妝水', recommended: true },
  { id: 'care-2', category: '保養品', text: '乳液', recommended: true },
  { id: 'care-3', category: '保養品', text: '防曬乳', recommended: true },
  { id: 'care-4', category: '保養品', text: '化妝鏡', recommended: false },
  { id: 'care-5', category: '保養品', text: '化妝品', recommended: false },

  // 兒童行李
  { id: 'kid-1', category: '兒童行李', text: '紗布被子', recommended: true },
  { id: 'kid-2', category: '兒童行李', text: '後背包', recommended: true },
  { id: 'kid-3', category: '兒童行李', text: '耳溫槍', recommended: true },
  { id: 'kid-4', category: '兒童行李', text: '玩具', recommended: false },
  { id: 'kid-5', category: '兒童行李', text: '尿布', recommended: true },
  { id: 'kid-6', category: '兒童行李', text: '濕紙巾', recommended: true },
  { id: 'kid-7', category: '兒童行李', text: '牙刷、牙膏', recommended: true },

  // 餐具
  { id: 'meal-1', category: '餐具', text: '奶瓶 1瓶', recommended: true },
  { id: 'meal-2', category: '餐具', text: '水壺', recommended: true },
  { id: 'meal-3', category: '餐具', text: '保溫瓶', recommended: true },
  { id: 'meal-4', category: '餐具', text: '奶瓶刷組', recommended: true },
  { id: 'meal-5', category: '餐具', text: '奶粉', recommended: true },
  { id: 'meal-6', category: '餐具', text: '餅乾', recommended: true },
  { id: 'meal-7', category: '餐具', text: '湯匙', recommended: true },
  { id: 'meal-8', category: '餐具', text: '小熊碗', recommended: true },
  { id: 'meal-9', category: '餐具', text: '食物剪', recommended: true },

  // 藥品
  { id: 'med-1', category: '藥品', text: '腸胃藥', recommended: true },
  { id: 'med-2', category: '藥品', text: '感冒藥', recommended: true },
  { id: 'med-3', category: '藥品', text: '外傷用藥', recommended: true },
  { id: 'med-4', category: '藥品', text: '美容膠', recommended: false },
  { id: 'med-5', category: '藥品', text: '過敏藥', recommended: true },
  { id: 'med-6', category: '藥品', text: '耳溫槍', recommended: true },
  { id: 'med-7', category: '藥品', text: 'OK蹦', recommended: true },

  // 兒童衣物
  { id: 'kidcloth-1', category: '兒童衣物', text: '上衣 ( )件、外套', recommended: true },
  { id: 'kidcloth-2', category: '兒童衣物', text: '褲子 ( )件', recommended: true },
  { id: 'kidcloth-3', category: '兒童衣物', text: '帽子', recommended: true },
  { id: 'kidcloth-4', category: '兒童衣物', text: '襪子 ( )雙', recommended: true },
  { id: 'kidcloth-5', category: '兒童衣物', text: '手套', recommended: true },
  { id: 'kidcloth-6', category: '兒童衣物', text: '鞋子', recommended: true },
];

export interface DrivingRule {
  title: string;
  icon: string;
  summary: string;
  rules: string[];
}

export const DRIVING_RULES: DrivingRule[] = [
  {
    title: '三不原則：不急起步、不急轉彎、不急煞車',
    icon: 'Snowflake',
    summary: '雪道摩擦力僅為普通柏油路的三分之一，所有操作都要極度柔和。',
    rules: [
      '保持平時「3倍以上」安全車距（國道行駛至少保持 100 公尺以上）',
      '起步時輕踩油門，若儀表板打滑燈（ESC）閃爍，立刻鬆油門讓輪胎重新咬合',
      '轉彎前在直線路段「提早完全減速」，彎道中切忌重踩煞車',
    ],
  },
  {
    title: '過夜停車鐵律：立起前後雨刷',
    icon: 'Car',
    summary: '北海道零度以下過夜，未立起的雨刷會被融雪水牢牢凍結在玻璃上，硬扯會撕裂橡膠！',
    rules: [
      '每晚停妥車輛後，手動將前後雨刷拉至「垂直立起」角度',
      '手煞車拉起適度即可，極寒地區（-10°C以下）手煞車纜線可能凍結，排入 P 檔並放輪擋防滑',
      '早晨發動車輛後先開暖氣與後窗除霧線，用雪刷輕刮玻璃，切忌淋熱水（玻璃會爆裂）',
    ],
  },
  {
    title: '恐怖隱形殺手：黑冰（Black Ice）',
    icon: 'AlertTriangle',
    summary: '看似只是潮濕黑色柏油路面，實際是一層光滑透明薄冰，極度容易發生甩尾！',
    rules: [
      '常見於：橋樑高架、隧道出入口、十字路口煞車區、被山壁遮蔽的陰涼彎道',
      '氣溫在 +2°C 至 -4°C 最易生成黑冰，看見路面有反光即代表結冰，務必提前放慢車速',
      '若發生輕微甩尾打滑：不要驚慌猛打方向盤，鬆開油門，順著打滑方向輕轉校正',
    ],
  },
  {
    title: '善用 B 檔（引擎煞車）防熱衰竭',
    icon: 'Compass',
    summary: '阿寒山區與石北峠長下坡，若持續踩著腳煞車，容易導致煞車油過熱失靈或直接打滑。',
    rules: [
      '遇長下坡或陡坡，將排檔桿撥至「B」檔（或 S/L 檔）',
      '利用引擎轉速阻力自然降低車速，腳煞車僅作輔助輕點',
      '高速公路嚴禁開啟定速巡航（Cruise Control），全時人工精準掌握油門',
    ],
  },
  {
    title: '山區油量警戒 ＆ 日落前抵達',
    icon: 'Fuel',
    summary: '道東地區加油站相距動輒 50-70 公里，且鄉村加油站常在下午 17:00 或 18:00 關門！',
    rules: [
      '油箱指針掉到「一半」時，見到加油站就要加滿',
      '北海道雪季日落約在 16:00 - 16:20，天黑後山路無路燈且能見度驟降，盡量規劃 16:30 前入住飯店',
      '若遇蝦夷鹿在路邊，請減速以閃大燈提醒，切勿長按喇叭恐驚嚇鹿隻撞擊車門',
    ],
  },
];



export interface EmergencyContact {
  name: string;
  phone: string;
  note: string;
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: '日本道路救援 (JAF)', phone: '#8139 / 0570-00-8139', note: '24小時道路救援（電瓶接電、雪地脫困、補胎）' },
  { name: '日本警察局 (事故報警)', phone: '110', note: '只要發生自駕車損擦撞，無論多小都必須報警取得事故證明，否則租車保險無效！' },
  { name: '救護車 / 火警', phone: '119', note: '突發急性身體不適或火災緊急求救' },
  { name: '台北駐日代表處 札幌分處', phone: '+81-11-222-2909', note: '緊急護照遺失或重大急難救助（札幌中央區）' },
  { name: '北海道道路即時資訊專線', phone: '011-709-2311', note: '查詢國道與峠道閉鎖最新路況（北の道ナビ）' },
];
