const fs = require('fs');
const path = require('path');

const en = {
  nav: {
    dashboard: "Dashboard", ecos: "ECOs", products: "Products", boms: "BoMs",
    reports: "Reports", admin: "Admin", settings: "Settings", sign_out: "Sign out", language: "Language"
  },
  dashboards: {
    eng_title: "Engineering Dashboard", eng_sub: "Manage your ECO drafts and track submissions",
    my_drafts: "My Drafts", awaiting_sub: "Awaiting submission", in_review: "In Review",
    pending_app: "Pending approval", draft_new: "Draft New ECO", start_new: "Start a new change",
    recent_work: "My Recent Work", view_drafts: "View all drafts", admin_title: "System Control Panel",
    admin_sub: "Manage users, security, and global workflows", active_users: "Active Users",
    across_roles: "Across 4 roles", approval_rules: "Approval Rules", active_cond: "Active conditions",
    eco_stages: "ECO Stages", workflow_steps: "Workflow steps", sys_health: "System Health",
    uptime: "Uptime", user_overview: "User Management Overview", app_title: "Approvals Dashboard",
    app_sub: "Review and sign off on pending Engineering Change Orders", pending_review: "Pending Review",
    awaiting_sig: "Awaiting your signature", urgent_actions: "Urgent Actions", high_priority: "High priority ECOs",
    completed_today: "Completed Today", recently_approved: "Recently approved", assigned_to_me: "ECOs Assigned to Me",
    review_diff: "Review Diff", all_caught_up: "You're all caught up!", submitted_by: "Submitted by",
    ops_title: "Operations Dashboard", ops_sub: "Production-ready Products and Bills of Materials",
    active_prods: "Active Products", ready_mfg: "Ready for manufacturing", active_boms: "Active BoMs",
    approved_ml: "Approved material lists", sys_status: "System Status", all_nominal: "All systems nominal",
    recently_activated: "Recently Activated Products", view_all: "View all"
  },
  eco: {
    title: "Engineering Change Orders", subtitle: "Manage all product and BoM changes through controlled workflow",
    create: "Create New ECO", eco_number: "ECO Number", eco_title: "Title", type: "Type",
    product: "Product", bom: "Bill of Materials", stage: "Stage", priority: "Priority",
    created_by: "Created By", description: "Description", changes: "Changes", approval_log: "Approval Log",
    version_history: "Version History", effective_date: "Effective Date", new_version: "New Version",
    version_bump: "Version Bump Required", search: "Search ECOs...", no_ecos: "No ECOs found",
    generate_desc: "Generate Description", generating: "Generating...", ai_generated: "AI-generated — you can edit this",
    export_pdf: "Export PDF", qr_code: "QR Code", predicted_impact: "Predicted Impact Analysis",
    impact_subtitle: "Calculated intelligently before you approve", net_cost: "NET COST CHANGE",
    labor_time: "LABOR / TIME CHANGE", production_scope: "PRODUCTION SCOPE", per_unit: "per unit produced",
    per_unit_assembled: "per unit assembled", wip_orders: "WIP orders", total_units: "total units immediately affected",
    active_mfg: "active in manufacturing", breakdown: "Breakdown of Direct Changes", system_rec: "System Recommendation",
    view_components: "View Components", new_eco: "New ECO", back_to_ecos: "Back to ECOs",
    create_title: "Create Engineering Change Order", create_sub: "Define the changes to be made through controlled workflow",
    info: "ECO Information", select_product_ph: "Choose a product...", select_bom_ph: "Choose a BoM...",
    version_update: "Version Update", version_update_yes: "A new version will be created", version_update_no: "No version bump",
    change_details: "Change Details", field: "Field", old_value: "Old Value", new_value: "New Value",
    attachments: "Attachments / Images", attach_desc: "Upload product images, BoM diagrams, design sketches, or supporting documents. These will be reviewed during the approval process.",
    view_details: "View ECO Details", no_results_desc: "No engineering change orders match your criteria."
  },
  stages: { New: "New", "In Review": "In Review", Approval: "Approval", Done: "Done", Rejected: "Rejected", Draft: "Draft", "All": "All" },
  priority: { High: "High", Medium: "Medium", Low: "Low" },
  roles: { Admin: "Admin", "Engineering User": "Engineering User", Approver: "Approver", "Operations User": "Operations User" },
  risk: { title: "Risk Analysis", low: "LOW RISK", medium: "MEDIUM RISK", high: "HIGH RISK", score: "Score", factors: "RISK FACTORS", positives: "POSITIVE FACTORS", analyzing: "Analyzing risk factors...", unavailable: "Risk analysis unavailable" },
  actions: { approve: "Approve ECO", reject: "Reject ECO", submit_review: "Submit for Review", save: "Save", cancel: "Cancel", "delete": "Delete", edit: "Edit", view: "View", download: "Download", open_link: "Open Link", confirm: "Confirm", back: "Back", next: "Next", close: "Close", search: "Search" },
  forms: { required: "This field is required", select_product: "Select a product", select_bom: "Select a BoM", select_type: "Select type", select_priority: "Select priority", select_stage: "Select stage", add_change: "Add Change", field_name: "Field Name", old_value: "Old Value", new_value: "New Value", change_type: "Change Type", comment: "Comment (optional)", comment_ph: "Add a comment for the approval log...", desc_placeholder: "Enter description or click Generate...", modified: "Modified", added: "Added", removed: "Removed" },
  auth: { login: "Sign In", email: "Email address", password: "Password", signing_in: "Signing in...", welcome_back: "Welcome back!", login_subtitle: "Sign in to manage your engineering change orders and product lifecycle.", forgot: "Forgot Password?", demo_accounts: "Demo Accounts", not_member: "Not a member?", contact_admin: "Contact Admin", make_easier: "Make your lifecycle easier and organized with", quick_login: "Quick Login" },
  products: { title: "Products", subtitle: "Managed product catalog with version control", sku: "SKU", version: "Version", status: "Status", category: "Category", active: "Active", archived: "Archived", no_products: "No products found", search: "Search products...", all: "All", loading: "Loading product catalog...", no_results: "Try adjusting your search or filters.", view_details: "View Details" },
  boms: { title: "Bills of Materials", subtitle: "Component structures and manufacturing operations", no_boms: "No BoMs found", new_bom: "New BoM", search: "Search BoMs...", loading: "Loading Bills of Materials...", no_results: "Try adjusting your search.", bom_name: "BoM Name", components: "Components", parts: "parts", view_bom: "View BoM" },
  admin: { title: "Admin Panel", users: "Users", create_user: "Create User", user_name: "Full Name", user_email: "Email Address", user_role: "Role", user_password: "Password", password_hint: "Leave empty to auto-generate", create_invite: "Create User & Send Invite", creating: "Creating...", reset_password: "Reset Password", delete_user: "Delete User", user_management: "User Management", um_sub: "Manage system access, roles, and permissions", add_user: "Add User", search_ph: "Search users by name or email...", filter: "Filter", role: "Role", user: "User", status: "Status", actions: "Actions", loading: "Loading users...", no_data: "No Data Available.", edit: "Edit", showing: "Showing", to: "to", "of": "of", users_count: "users", prev: "Previous", page: "Page", next: "Next", edit_user: "Edit User", add_new: "Add New User", full_name: "Full Name", email_addr: "Email Address", sys_role: "System Role", cancel: "Cancel", save_changes: "Save Changes", active: "Active", inactive: "Inactive" },
  toasts: { eco_created: "ECO created successfully", eco_approved: "ECO approved successfully", eco_rejected: "ECO rejected", eco_updated: "ECO updated", user_created: "User created and invite sent", saved: "Saved successfully", error: "Something went wrong", lang_changed: "Language updated" },
  db_status: { postgres: "PostgreSQL — primary active", mongo: "MongoDB — backup active", syncing: "Syncing databases...", failovers: "Failovers" },
  qr: { title: "QR Code", scan_hint: "Scan with any phone camera to open this ECO on the factory floor.", public_access: "Publicly accessible — no login required", pending_access: "Only visible after approval", factory_view: "Factory View" },
  empty: { no_data: "No data found", no_results: "No results for your search", loading: "Loading..." }
};

const hi = {
  nav: {
    dashboard: "डैशबोर्ड", ecos: "ECO सूची", products: "उत्पाद", boms: "सामग्री सूची",
    reports: "रिपोर्ट", admin: "व्यवस्थापक", settings: "सेटिंग्स", sign_out: "साइन आउट", language: "भाषा"
  },
  dashboards: {
    eng_title: "इंजीनियरिंग डैशबोर्ड", eng_sub: "अपने ECO ड्राफ्ट प्रबंधित करें और सबमिशन ट्रैक करें",
    my_drafts: "मेरे ड्राफ्ट", awaiting_sub: "सबमिशन की प्रतीक्षा में", in_review: "समीक्षा में",
    pending_app: "अनुमोदन की प्रतीक्षा में", draft_new: "नया ECO ड्राफ्ट करें", start_new: "नया बदलाव शुरू करें",
    recent_work: "मेरा हाल का काम", view_drafts: "सभी ड्राफ्ट देखें", admin_title: "सिस्टम नियंत्रण कक्ष",
    admin_sub: "उपयोगकर्ताओं, सुरक्षा और वैश्विक वर्कफ़्लो प्रबंधित करें", active_users: "सक्रिय उपयोगकर्ता",
    across_roles: "4 भूमिकाओं में", approval_rules: "अनुमोदन नियम", active_cond: "सक्रिय शर्तें",
    eco_stages: "ECO चरण", workflow_steps: "वर्कफ़्लो कदम", sys_health: "सिस्टम स्वास्थ्य",
    uptime: "अपटाइम", user_overview: "उपयोगकर्ता प्रबंधन अवलोकन", app_title: "अनुमोदन डैशबोर्ड",
    app_sub: "लंबित इंजीनियरिंग परिवर्तन आदेशों की समीक्षा करें और हस्ताक्षर करें", pending_review: "समीक्षा लंबित",
    awaiting_sig: "आपके हस्ताक्षर की प्रतीक्षा में", urgent_actions: "तत्काल कार्रवाई", high_priority: "उच्च प्राथमिकता वाले ECO",
    completed_today: "आज पूरा हुआ", recently_approved: "हाल ही में स्वीकृत", assigned_to_me: "मुझे सौंपे गए ECO",
    review_diff: "अंतर की समीक्षा करें", all_caught_up: "आपका सारा काम पूरा हो गया है!", submitted_by: "द्वारा प्रस्तुत",
    ops_title: "संचालन डैशबोर्ड", ops_sub: "उत्पादन के लिए तैयार उत्पाद और सामग्री सूची",
    active_prods: "सक्रिय उत्पाद", ready_mfg: "निर्माण के लिए तैयार", active_boms: "सक्रिय BoM",
    approved_ml: "अनुमोदित सामग्री सूची", sys_status: "सिस्टम स्थिति", all_nominal: "सभी सिस्टम सामान्य",
    recently_activated: "हाल ही में सक्रिय उत्पाद", view_all: "सभी देखें"
  },
  eco: {
    title: "इंजीनियरिंग परिवर्तन आदेश", subtitle: "नियंत्रित वर्कफ़्लो के माध्यम से सभी उत्पाद और BoM परिवर्तन प्रबंधित करें",
    create: "नया ECO बनाएं", eco_number: "ECO नंबर", eco_title: "शीर्षक", type: "प्रकार",
    product: "उत्पाद", bom: "सामग्री सूची", stage: "चरण", priority: "प्राथमिकता",
    created_by: "द्वारा बनाया गया", description: "विवरण", changes: "परिवर्तन", approval_log: "अनुमोदन लॉग",
    version_history: "संस्करण इतिहास", effective_date: "प्रभावी तिथि", new_version: "नया संस्करण",
    version_bump: "संस्करण अपडेट आवश्यक", search: "ECO खोजें...", no_ecos: "कोई ECO नहीं मिला",
    generate_desc: "विवरण उत्पन्न करें", generating: "उत्पन्न हो रहा है...", ai_generated: "AI द्वारा उत्पन्न — आप संपादित कर सकते हैं",
    export_pdf: "PDF निर्यात करें", qr_code: "QR कोड", predicted_impact: "पूर्वानुमानित प्रभाव विश्लेषण",
    impact_subtitle: "अनुमोदन से पहले बुद्धिमानी से गणना की गई", net_cost: "शुद्ध लागत परिवर्तन",
    labor_time: "श्रम / समय परिवर्तन", production_scope: "उत्पादन दायरा", per_unit: "प्रति इकाई उत्पादित",
    per_unit_assembled: "प्रति इकाई असेंबल", wip_orders: "WIP आदेश", total_units: "कुल अनुक्रमित इकाइयां",
    active_mfg: "उत्पादन में सक्रिय", breakdown: "प्रत्यक्ष परिवर्तनों का विवरण", system_rec: "सिस्टम सिफारिश",
    view_components: "घटक देखें", new_eco: "नया ECO", back_to_ecos: "ECO पर वापस जाएं",
    create_title: "इंजीनियरिंग परिवर्तन आदेश बनाएं", create_sub: "नियंत्रित वर्कफ़्लो के माध्यम से किए जाने वाले परिवर्तनों को परिभाषित करें",
    info: "ECO जानकारी", select_product_ph: "एक उत्पाद चुनें...", select_bom_ph: "एक BoM चुनें...",
    version_update: "संस्करण अद्यतन", version_update_yes: "एक नया संस्करण बनाया जाएगा", version_update_no: "कोई संस्करण पंप नहीं",
    change_details: "परिवर्तन विवरण", field: "क्षेत्र", old_value: "पुराना मूल्य", new_value: "नया मूल्य",
    attachments: "संलग्नक / छवियां", attach_desc: "उत्पाद छवियां, BoM आरेख, डिजाइन स्केच अपलोड करें।",
    view_details: "ECO विवरण देखें", no_results_desc: "आपकी खोज के लिए कोई परिणाम नहीं मिला।"
  },
  stages: { New: "नया", "In Review": "समीक्षा में", Approval: "अनुमोदन", Done: "पूर्ण", Rejected: "अस्वीकृत", Draft: "ड्राफ्ट", "All": "सभी" },
  priority: { High: "उच्च", Medium: "मध्यम", Low: "कम" },
  roles: { Admin: "व्यवस्थापक", "Engineering User": "इंजीनियरिंग उपयोगकर्ता", Approver: "अनुमोदक", "Operations User": "संचालन उपयोगकर्ता" },
  risk: { title: "जोखिम विश्लेषण", low: "कम जोखिम", medium: "मध्यम जोखिम", high: "उच्च जोखिम", score: "स्कोर", factors: "जोखिम कारक", positives: "सकारात्मक कारक", analyzing: "जोखिम कारकों का विश्लेषण हो रहा है...", unavailable: "जोखिम विश्लेषण उपलब्ध नहीं" },
  actions: { approve: "ECO अनुमोदित करें", reject: "ECO अस्वीकार करें", submit_review: "समीक्षा के लिए जमा करें", save: "सहेजें", cancel: "रद्द करें", "delete": "हटाएं", edit: "संपादित करें", view: "देखें", download: "डाउनलोड करें", open_link: "लिंक खोलें", confirm: "पुष्टि करें", back: "वापस", next: "अगला", close: "बंद करें", search: "खोजें" },
  forms: { required: "यह फ़ील्ड आवश्यक है", select_product: "उत्पाद चुनें", select_bom: "सामग्री सूची चुनें", select_type: "प्रकार चुनें", select_priority: "प्राथमिकता चुनें", select_stage: "चरण चुनें", add_change: "परिवर्तन जोड़ें", field_name: "फ़ील्ड नाम", old_value: "पुराना मूल्य", new_value: "नया मूल्य", change_type: "परिवर्तन प्रकार", comment: "टिप्पणी (वैकल्पिक)", comment_ph: "अनुमोदन लॉग के लिए टिप्पणी जोड़ें...", desc_placeholder: "विवरण दर्ज करें या उत्पन्न करें...", modified: "संशोधित", added: "जोड़ा गया", removed: "हटाया गया" },
  auth: { login: "साइन इन करें", email: "ईमेल पता", password: "पासवर्ड", signing_in: "साइन इन हो रहा है...", welcome_back: "वापसी पर स्वागत है!", login_subtitle: "अपने उत्पाद जीवन चक्र को प्रबंधित करने के लिए साइन इन करें।", forgot: "पासवर्ड भूल गए?", demo_accounts: "डेमो खाते", not_member: "सदस्य नहीं हैं?", contact_admin: "व्यवस्थापक से संपर्क करें", make_easier: "अपने जीवन चक्र को आसान और व्यवस्थित बनाएं", quick_login: "त्वरित लॉगिन" },
  products: { title: "उत्पाद", subtitle: "संस्करण नियंत्रण के साथ प्रबंधित उत्पाद सूची", sku: "SKU", version: "संस्करण", status: "स्थिति", category: "श्रेणी", active: "सक्रिय", archived: "संग्रहीत", no_products: "कोई उत्पाद नहीं मिला", search: "उत्पाद खोजें...", all: "सभी", loading: "उत्पाद सूची लोड हो रही है...", no_results: "अपनी खोज या फ़िल्टर समायोजित करने का प्रयास करें।", view_details: "विवरण देखें" },
  boms: { title: "सामग्री सूची", subtitle: "घटक संरचनाएं और निर्माण संचालन", no_boms: "कोई BoM नहीं मिला", new_bom: "नया BoM", search: "BoM खोजें...", loading: "सामग्री सूची लोड हो रही है...", no_results: "अपनी खोज समायोजित करने का प्रयास करें।", bom_name: "BoM नाम", components: "घटक", parts: "भाग", view_bom: "BoM देखें" },
  admin: { title: "व्यवस्थापक पैनल", users: "उपयोगकर्ता", create_user: "उपयोगकर्ता बनाएं", user_name: "पूरा नाम", user_email: "ईमेल पता", user_role: "भूमिका", user_password: "पासवर्ड", password_hint: "स्वचालित रूप से उत्पन्न करने के लिए खाली छोड़ें", create_invite: "उपयोगकर्ता बनाएं और आमंत्रण भेजें", creating: "बन रहा है...", reset_password: "पासवर्ड रीसेट करें", delete_user: "उपयोगकर्ता हटाएं", user_management: "उपयोगकर्ता प्रबंधन", um_sub: "सिस्टम एक्सेस, भूमिकाएं और अनुमतियां प्रबंधित करें", add_user: "उपयोगकर्ता जोड़ें", search_ph: "नाम या ईमेल द्वारा उपयोगकर्ता खोजें...", filter: "फ़िल्टर", role: "भूमिका", user: "उपयोगकर्ता", status: "स्थिति", actions: "कार्रवाइयां", loading: "उपयोगकर्ता लोड हो रहे हैं...", no_data: "कोई डेटा उपलब्ध नहीं।", edit: "संपादित करें", showing: "दिखा रहा है", to: "से", "of": "में से", users_count: "उपयोगकर्ता", prev: "पिछला", page: "पृष्ठ", next: "अगला", edit_user: "उपयोगकर्ता संपादित करें", add_new: "नया उपयोगकर्ता जोड़ें", full_name: "पूरा नाम", email_addr: "ईमेल पता", sys_role: "सिस्टम भूमिका", cancel: "रद्द करें", save_changes: "परिवर्तन सहेजें", active: "सक्रिय", inactive: "निष्क्रिय" },
  toasts: { eco_created: "ECO सफलतापूर्वक बनाया गया", eco_approved: "ECO सफलतापूर्वक अनुमोदित किया गया", eco_rejected: "ECO अस्वीकार कर दिया गया", eco_updated: "ECO अपडेट किया गया", user_created: "उपयोगकर्ता बनाया गया और आमंत्रण भेजा गया", saved: "सफलतापूर्वक सहेजा गया", error: "कुछ गलत हो गया", lang_changed: "भाषा अपडेट की गई" },
  db_status: { postgres: "PostgreSQL — प्राथमिक सक्रिय", mongo: "MongoDB — बैकअप सक्रिय", syncing: "डेटाबेस सिंक हो रहा है...", failovers: "फेलओवर" },
  qr: { title: "QR कोड", scan_hint: "फैक्ट्री में इस ECO को खोलने के लिए किसी भी फोन कैमरे से स्कैन करें।", public_access: "सार्वजनिक रूप से सुलभ — लॉगिन की आवश्यकता नहीं", pending_access: "अनुमोदन के बाद ही दिखाई देगा", factory_view: "फैक्ट्री व्यू" },
  empty: { no_data: "कोई डेटा नहीं मिला", no_results: "आपकी खोज के लिए कोई परिणाम नहीं", loading: "लोड हो रहा है..." }
};

const gu = {
  nav: {
    dashboard: "ડૅશબોર્ડ", ecos: "ECO સૂચિ", products: "ઉત્પાદન", boms: "સામગ્રી સૂચિ",
    reports: "અહેવાલ", admin: "સંચાલક", settings: "સેટિંગ્સ", sign_out: "સાઇન આઉટ", language: "ભાષા"
  },
  dashboards: {
    eng_title: "એન્જિનિયરિંગ ડૅશબોર્ડ", eng_sub: "તમારા ECO ડ્રાફ્ટ સંચાલિત કરો અને સબમિશન ટ્રૅક કરો",
    my_drafts: "મારા ડ્રાફ્ટ", awaiting_sub: "સબમિશનની રાહ જોવાય છે", in_review: "સમીક્ષા હેઠળ",
    pending_app: "મંજૂરી બાકી", draft_new: "નવો ECO ડ્રાફ્ટ કરો", start_new: "નવો ફેરફાર શરૂ કરો",
    recent_work: "મારું તાજેતરનું કામ", view_drafts: "બધા ડ્રાફ્ટ જુઓ", admin_title: "સિસ્ટમ કંટ્રોલ પેનલ",
    admin_sub: "વપરાશકર્તાઓ, સુરક્ષા અને વૈશ્વિક વર્કફ્લો સંચાલિત કરો", active_users: "સક્રિય વપરાશકર્તાઓ",
    across_roles: "4 ભૂમિકાઓમાં", approval_rules: "મંજૂરી નિયમો", active_cond: "સક્રિય શરતો",
    eco_stages: "ECO તબક્કા", workflow_steps: "વર્કફ્લો પગલાં", sys_health: "સિસ્ટમ સ્વાસ્થ્ય",
    uptime: "અપટાઇમ", user_overview: "વપરાશકર્તા સંચાલન વિહંગાવલોકન", app_title: "મંજૂરી ડૅશબોર્ડ",
    app_sub: "બાકી એન્જિનિયરિંગ ફેરફાર આદેશોની સમીક્ષા કરો અને સહી કરો", pending_review: "સમીક્ષા બાકી",
    awaiting_sig: "તમારી સહીની રાહ જોવાય છે", urgent_actions: "તાત્કાલિક પગલાં", high_priority: "ઉચ્ચ પ્રાધાન્યતા ECO",
    completed_today: "આજે પૂર્ણ", recently_approved: "તાજેતરમાં મંજૂર", assigned_to_me: "મને સોંપાયેલ ECO",
    review_diff: "તફાવતની સમીક્ષા કરો", all_caught_up: "તમરું બધું કામ પૂરું થઈ ગયું છે!", submitted_by: "દ્વારા સબમિટ કરેલ",
    ops_title: "ઓપરેશન્સ ડૅશબોર્ડ", ops_sub: "ઉત્પાદન-તૈયાર ઉત્પાદનો અને સામગ્રીની સૂચિ",
    active_prods: "સક્રિય ઉત્પાદનો", ready_mfg: "ઉત્પાદન માટે તૈયાર", active_boms: "સક્રિય BoM",
    approved_ml: "મંજૂર સામગ્રીની સૂચિ", sys_status: "સિસ્ટમ સ્થિતિ", all_nominal: "બધી સિસ્ટમ સામાન્ય",
    recently_activated: "તાજેતરમાં સક્રિય કરેલ ઉત્પાદનો", view_all: "બધા જુઓ"
  },
  eco: {
    title: "એન્જિનિયરિંગ ચેન્જ ઓર્ડર", subtitle: "નિયંત્રિત વર્કફ્લો દ્વારા તમામ ઉત્પાદન અને BoM ફેરફારો સંચાલિત કરો",
    create: "નવો ECO બનાવો", eco_number: "ECO નંબર", eco_title: "શીર્ષક", type: "પ્રકાર",
    product: "ઉત્પાદન", bom: "સામગ્રી સૂચિ", stage: "તબક્કો", priority: "પ્રાધાન્યતા",
    created_by: "બનાવનાર", description: "વિગત", changes: "ફેરફારો", approval_log: "મંજૂરી લૉગ",
    version_history: "આવૃત્તિ ઇતિહાસ", effective_date: "અસરકારક તારીખ", new_version: "નવી આવૃત્તિ",
    version_bump: "આવૃત્તિ અપડેટ જરૂરી", search: "ECO શોધો...", no_ecos: "કોઈ ECO મળ્યા નથી",
    generate_desc: "વિગત બનાવો", generating: "બની રહ્યું છે...", ai_generated: "AI દ્વારા બનાવેલ — તમે સંપાદિત કરી શકો છો",
    export_pdf: "PDF નિકાસ કરો", qr_code: "QR કોડ", predicted_impact: "અનુમાનિત અસર વિશ્લેષણ",
    impact_subtitle: "મંજૂરી આપતા પહેલા બુદ્ધિપૂર્વક ગણતરી કરેલ", net_cost: "ચોખ્ખો ખર્ચ ફેરફાર",
    labor_time: "શ્રમ / સમય ફેરફાર", production_scope: "ઉત્પાદન વ્યાપ", per_unit: "પ્રતિ બનેલ ઉત્પાદન દીઠ",
    per_unit_assembled: "પ્રતિ એસેમ્બલ ઉત્પાદન દીઠ", wip_orders: "WIP ઓર્ડર", total_units: "કુલ એકમો તરત અસરગ્રસ્ત",
    active_mfg: "ઉત્પાદનમાં સક્રિય", breakdown: "પ્રત્યક્ષ ફેરફારોની વિગત", system_rec: "સિસ્ટમ ભલામણ",
    view_components: "ઘટકો જુઓ", new_eco: "નવો ECO", back_to_ecos: "ECO પર પાછા જાઓ",
    create_title: "એન્જિનિયરિંગ ચેન્જ ઓર્ડર બનાવો", create_sub: "નિયંત્રિત વર્કફ્લો દ્વારા કરવાના ફેરફારો વ્યાખ્યાયિત કરો",
    info: "ECO માહિતી", select_product_ph: "ઉત્પાદન પસંદ કરો...", select_bom_ph: "BoM પસંદ કરો...",
    version_update: "આવૃત્તિ અપડેટ", version_update_yes: "નવી આવૃત્તિ બનાવવામાં આવશે", version_update_no: "કોઈ આવૃત્તિ ફેરફાર નથી",
    change_details: "ફેરફાર વિગતો", field: "ક્ષેત્ર", old_value: "જૂની કિંમત", new_value: "નવી કિંમત",
    attachments: "જોડાણો / છબીઓ", attach_desc: "ઉત્પાદન છબીઓ, BoM આકૃતિઓ, ડિઝાઇન સ્કેચ અપલોડ કરો.",
    view_details: "ECO વિગતો જુઓ", no_results_desc: "તમારી શોધ માટે કોઈ પરિણામ મળ્યું નથી."
  },
  stages: { New: "નવું", "In Review": "સમીક્ષા હેઠળ", Approval: "મંજૂરી", Done: "પૂર્ણ", Rejected: "નકારાયેલ", Draft: "ડ્રાફ્ટ", "All": "બધા" },
  priority: { High: "ઉચ્ચ", Medium: "મધ્યમ", Low: "ઓછું" },
  roles: { Admin: "સંચાલક", "Engineering User": "એન્જિનિયરિંગ વપરાશકર્તા", Approver: "મંજૂરી આપનાર", "Operations User": "ઓપરેશન્સ વપરાશકર્તા" },
  risk: { title: "જોખમ વિશ્લેષણ", low: "ઓછું જોખમ", medium: "મધ્યમ જોખમ", high: "ઉચ્ચ જોખમ", score: "સ્કોર", factors: "જોખમ પરિબળો", positives: "સકારાત્મક પરિબળો", analyzing: "જોખમ પરિબળોનું વિશ્લેષણ થઈ રહ્યું છે...", unavailable: "જોખમ વિશ્લેષણ ઉપલબ્ધ નથી" },
  actions: { approve: "ECO મંજૂર કરો", reject: "ECO નકારો", submit_review: "સમીક્ષા માટે સબમિટ કરો", save: "સાચવો", cancel: "રદ કરો", "delete": "કાઢી નાખો", edit: "ફેરફાર કરો", view: "જુઓ", download: "ડાઉનલોડ કરો", open_link: "લિંક ખોલો", confirm: "પુષ્ટિ કરો", back: "પાછળ", next: "આગળ", close: "બંધ કરો", search: "શોધો" },
  forms: { required: "આ ફીલ્ડ જરૂરી છે", select_product: "ઉત્પાદન પસંદ કરો", select_bom: "BoM પસંદ કરો", select_type: "પ્રકાર પસંદ કરો", select_priority: "પ્રાધાન્ય પસંદ કરો", select_stage: "તબક્કો પસંદ કરો", add_change: "ફેરફાર ઉમેરો", field_name: "ફીલ્ડ નામ", old_value: "જૂની કિંમત", new_value: "નવી કિંમત", change_type: "ફેરફારનો પ્રકાર", comment: "ટિપ્પણી (વૈકલ્પિક)", comment_ph: "મંજૂરી લૉગ માટે ટિપ્પણી ઉમેરો...", desc_placeholder: "વિગત દાખલ કરો અથવા બનાવો...", modified: "સુધારેલ", added: "ઉમેર્યું", removed: "દૂર કર્યું" },
  auth: { login: "સાઇન ઇન કરો", email: "ઈ-મેઈલ સરનામું", password: "પાસવર્ડ", signing_in: "સાઇન ઇન થઈ રહ્યું છે...", welcome_back: "પાછા આવ્યા, સ્વાગત છે!", login_subtitle: "તમારા ઉત્પાદન જીવનચક્રનું સંચાલન કરવા સાઇન ઇન કરો.", forgot: "પાસવર્ડ ભૂલી ગયા છો?", demo_accounts: "ડેમો એકાઉન્ટ્સ", not_member: "સભ્ય નથી?", contact_admin: "સંચાલકનો સંપર્ક કરો", make_easier: "તમારા જીવનચક્રને સરળ અને વ્યવસ્થિત બનાવો", quick_login: "ઝડપી લૉગિન" },
  products: { title: "ઉત્પાદનો", subtitle: "આવૃત્તિ નિયંત્રણ સાથે સંચાલિત ઉત્પાદન સૂચિ", sku: "SKU", version: "આવૃત્તિ", status: "સ્થિતિ", category: "શ્રેણી", active: "સક્રિય", archived: "સંગ્રહિત", no_products: "કોઈ ઉત્પાદનો મળ્યા નથી", search: "ઉત્પાદનો શોધો...", all: "બધા", loading: "ઉત્પાદન સૂચિ લોડ થઈ રહી છે...", no_results: "તમારી શોધ અથવા ફિલ્ટર ગોઠવવાનો પ્રયાસ કરો.", view_details: "વિગતો જુઓ" },
  boms: { title: "સામગ્રીની સૂચિ", subtitle: "ઘટક માળખાં અને ઉત્પાદન કામગીરી", no_boms: "કોઈ BoM મળ્યા નથી", new_bom: "નવો BoM", search: "BoM શોધો...", loading: "સામગ્રી સૂચિ લોડ થઈ રહી છે...", no_results: "તમારી શોધ ગોઠવવાનો પ્રયાસ કરો.", bom_name: "BoM નામ", components: "ઘટકો", parts: "ભાગો", view_bom: "BoM જુઓ" },
  admin: { title: "સંચાલક પેનલ", users: "વપરાશકર્તાઓ", create_user: "વપરાશકર્તા બનાવો", user_name: "પૂરું નામ", user_email: "ઈ-મેઈલ સરનામું", user_role: "ભૂમિકા", user_password: "પાસવર્ડ", password_hint: "આપોઆપ બનાવવા માટે ખાલી છોડો", create_invite: "વપરાશકર્તા બનાવો અને આમંત્રણ મોકલો", creating: "બની રહ્યું છે...", reset_password: "પાસવર્ડ રીસેટ કરો", delete_user: "વપરાશકર્તા કાઢી નાખો", user_management: "વપરાશકર્તા સંચાલન", um_sub: "સિસ્ટમ ઍક્સેસ, ભૂમિકાઓ અને પરવાનગીઓ સંચાલિત કરો", add_user: "વપરાશકર્તા ઉમેરો", search_ph: "નામ અથવા ઈમેલ દ્વારા વપરાશકર્તાઓ શોધો...", filter: "ફિલ્ટર", role: "ભૂમિકા", user: "વપરાશકર્તા", status: "સ્થિતિ", actions: "ક્રિયાઓ", loading: "વપરાશકર્તાઓ લોડ થઈ રહ્યા છે...", no_data: "કોઈ ડેટા ઉપલબ્ધ નથી.", edit: "સંપાદિત કરો", showing: "બતાવી રહ્યું છે", to: "થી", "of": "કુલ", users_count: "વપરાશકર્તાઓ", prev: "પાછળ", page: "પૃષ્ઠ", next: "આગળ", edit_user: "વપરાશકર્તા સંપાદિત કરો", add_new: "નવો વપરાશકર્તા ઉમેરો", full_name: "પૂરું નામ", email_addr: "ઈ-મેઈલ સરનામું", sys_role: "સિસ્ટમ ભૂમિકા", cancel: "રદ કરો", save_changes: "ફેરફારો સાચવો", active: "સક્રિય", inactive: "નિષ્ક્રિય" },
  toasts: { eco_created: "ECO સફળતાપૂર્વક બનાવ્યો", eco_approved: "ECO સફળતાપૂર્વક મંજૂર કર્યો", eco_rejected: "ECO નકારી દેવામાં આવ્યો", eco_updated: "ECO અપડેટ થયો", user_created: "વપરાશકર્તા બનાવ્યો અને આમંત્રણ મોકલ્યો", saved: "સફળતાપૂર્વક સાચવ્યું", error: "કંઈક ખોટું થયું", lang_changed: "ભાષા અપડેટ થઈ" },
  db_status: { postgres: "PostgreSQL — પ્રાથમિક સક્રિય", mongo: "MongoDB — બેકઅપ સક્રિય", syncing: "ડેટાબેઝ સિંક થઈ રહ્યો છે...", failovers: "ફેલઓવર" },
  qr: { title: "QR કોડ", scan_hint: "ફૅક્ટરીમાં આ ECO ખોલવા માટે કોઈ પણ ફોન કૅમેરાથી સ્કૅન કરો.", public_access: "સાર્વજનિક રીતે સુલભ — લૉગિન જરૂરી નથી", pending_access: "મંજૂરી પછી જ દ્રશ્યમાન", factory_view: "ફૅક્ટરી વ્યૂ" },
  empty: { no_data: "કોઈ ડેટા મળ્યો નહીં", no_results: "તમારી શોધ માટે કોઈ પરિણામ મળ્યું નથી", loading: "લોડ થઈ રહ્યું છે..." }
};

const dir = 'c:/Users/kakka/OneDrive/Desktop/ODOO_ PLM/Odoo_X_GV_PLM/Frontend/src/i18n';

fs.writeFileSync(path.join(dir, 'en.json'), JSON.stringify(en, null, 2));
fs.writeFileSync(path.join(dir, 'hi.json'), JSON.stringify(hi, null, 2));
fs.writeFileSync(path.join(dir, 'gu.json'), JSON.stringify(gu, null, 2));

console.log("Translation files generated!");
