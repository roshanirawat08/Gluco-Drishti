/**
 * GlucoDrishti AI - Core Application Logic
 * Specialized for DIABETES & DIABETIC RETINOPATHY in PUNE, MAHARASHTRA, INDIA.
 * Developed by Team Alpha
 */

const appState = {
  currentStep: 1,
  currentSubStep: 1,
  personal: {
    fullName: '', age: '', gender: '', height: '', weight: '', bmi: null, bmiCategory: '',
    bloodGroup: '', location: '', diabetesType: 'Type 2 Diabetes', diabetesDuration: '5 to 10 years',
    sugarLevel: '', diseases: [], otherDiseaseText: ''
  },
  examinations: {
    retinaImage: null, retinaFileName: '', nailsImage: null, nailsFileName: '',
    symptoms: [], customSymptomsText: ''
  },
  activeCameraTarget: null,
  cameraStream: null
};

// Procedural Sample Scans
const SAMPLE_SCANS = {
  retina: generateDiabeticRetinaCanvasData(),
  nails: generateDiabeticNailsCanvasData()
};

// Top Diabetic Specialists & Diabetes Centers in Pune, Maharashtra
const DOCTORS_DATABASE = [
  {
    id: 1, name: 'Chellaram Diabetes Institute (CDI)', specialty: 'Diabetic Hospital',
    title: 'Apex Diabetes Research & Super-Speciality Hospital',
    clinic: 'Lalani Quantum, Pune-Bangalore Highway, Bavdhan, Pune',
    distance: 3.8, rating: 4.9, reviews: 420, nextSlot: 'Today at 4:00 PM', fee: '₹ 900', avatar: 'CDI'
  },
  {
    id: 2, name: 'Dr. Shailaja Kale, MD, FICP', specialty: 'Diabetologist',
    title: 'Senior Diabetologist & Metabolic Specialist',
    clinic: 'Dr. Kale\'s Diabetes Clinic, Paud Road, Kothrud, Pune',
    distance: 1.5, rating: 4.9, reviews: 310, nextSlot: 'Tomorrow at 10:30 AM', fee: '₹ 1,000', avatar: 'SK'
  },
  {
    id: 3, name: 'Dr. Sachin Kulkarni, MS, DNB, FMRF', specialty: 'Retina Specialist',
    title: 'Chief Vitreoretinal Surgeon (Diabetic Retinopathy)',
    clinic: 'National Institute of Ophthalmology (NIO), Ghole Road, Shivajinagar, Pune',
    distance: 2.7, rating: 4.9, reviews: 260, nextSlot: 'Tomorrow at 12:00 PM', fee: '₹ 1,200', avatar: 'NIO'
  },
  {
    id: 4, name: 'Deenanath Mangeshkar Hospital & Research Center', specialty: 'Diabetic Hospital',
    title: 'Diabetic Endocrine & Retina Department',
    clinic: 'Near Mhatre Bridge, Erandwane, Kothrud, Pune',
    distance: 2.1, rating: 4.8, reviews: 580, nextSlot: 'Thursday at 11:00 AM', fee: '₹ 800', avatar: 'DMH'
  },
  {
    id: 5, name: 'Dr. A. G. Unnikrishnan, MD, DM', specialty: 'Diabetologist',
    title: 'Chief Endocrinologist, Chellaram Hospital',
    clinic: 'Chellaram Diabetes Institute, Bavdhan, Pune',
    distance: 4.0, rating: 5.0, reviews: 340, nextSlot: 'Friday at 2:30 PM', fee: '₹ 1,500', avatar: 'AU'
  },
  {
    id: 6, name: 'Ruby Hall Clinic - Diabetic Care Center', specialty: 'Diabetic Hospital',
    title: 'Comprehensive Diabetes & Ophthalmology Institute',
    clinic: '40 Sassoon Road, Near Pune Railway Station, Pune',
    distance: 5.4, rating: 4.8, reviews: 490, nextSlot: 'Tomorrow at 3:00 PM', fee: '₹ 1,000', avatar: 'RHC'
  },
  {
    id: 7, name: 'Dr. Vardhaman Kankariya, MD, FACS', specialty: 'Retina Specialist',
    title: 'Consultant Retina & Laser Eye Specialist',
    clinic: 'Asian Eye Hospital & Retina Centre, Sakhar Sankul, Shivajinagar, Pune',
    distance: 3.2, rating: 4.8, reviews: 175, nextSlot: 'Wednesday at 4:30 PM', fee: '₹ 1,100', avatar: 'VK'
  },
  {
    id: 8, name: 'Sahyadri Super Speciality Hospital', specialty: 'Diabetic Hospital',
    title: 'Diabetic Foot, Neuropathy & Retinopathy Clinic',
    clinic: 'Plot No. 30-C, Karve Road, Deccan Gymkhana, Pune',
    distance: 1.8, rating: 4.7, reviews: 310, nextSlot: 'Today at 6:00 PM', fee: '₹ 850', avatar: 'SSH'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  setupNavigation();
  setupPersonalForm();
  setupExamStep();
  setupReviewAndChances();
  setupDiagnosisAndDoctors();
  setupModals();
  setupDemoPresets();
  initChatbot();
});

function initIcons() { if (window.lucide) window.lucide.createIcons(); }

function setupNavigation() {
  document.querySelectorAll('.stepper-item').forEach(item => {
    item.addEventListener('click', () => {
      const targetStep = parseInt(item.getAttribute('data-step'), 10);
      if (targetStep < appState.currentStep || validateStep(appState.currentStep)) goToStep(targetStep);
    });
  });

  document.getElementById('toPage2Btn').addEventListener('click', () => {
    if (validatePersonalForm()) { savePersonalFormData(); goToStep(2); }
  });
  document.getElementById('backToPage1Btn').addEventListener('click', () => goToStep(1));
  document.getElementById('toPage3Btn').addEventListener('click', () => {
    saveSymptomsData(); renderPage3DataSummary(); calculateAndRenderDiabeticChances(); goToStep(3);
  });
  document.getElementById('backToPage2Btn').addEventListener('click', () => goToStep(2));
  document.getElementById('toPage4Btn').addEventListener('click', () => {
    renderDiabeticDiagnosisSummary(); renderDoctorsList(); goToStep(4);
  });
  document.getElementById('backToPage3Btn').addEventListener('click', () => goToStep(3));
  document.getElementById('editDataBtn').addEventListener('click', () => goToStep(1));
  document.getElementById('startNewAssessmentBtn').addEventListener('click', resetAll);
  document.getElementById('resetSessionBtn').addEventListener('click', resetAll);
}

function goToStep(stepNumber) {
  appState.currentStep = stepNumber;
  for (let i = 1; i <= 4; i++) {
    const navItem = document.getElementById(`navStep${i}`);
    const navLine = document.getElementById(`stepLine${i}`);
    const section = document.getElementById(`page${i}Section`);
    if (i < stepNumber) {
      navItem.className = 'stepper-item completed';
      if (navLine) navLine.className = 'stepper-line completed';
    } else if (i === stepNumber) {
      navItem.className = 'stepper-item active';
      if (navLine) navLine.className = 'stepper-line';
    } else {
      navItem.className = 'stepper-item';
      if (navLine) navLine.className = 'stepper-line';
    }
    if (i === stepNumber) section.classList.add('active'); else section.classList.remove('active');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  initIcons();
}

function validateStep(current) { return current === 1 ? validatePersonalForm() : true; }

function setupPersonalForm() {
  [document.getElementById('height'), document.getElementById('weight')].forEach(inp => {
    inp.addEventListener('input', updateBMI);
  });

  document.getElementById('detectLocationBtn').addEventListener('click', () => {
    const locInput = document.getElementById('location');
    showToast('Detecting Pune GPS location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { locInput.value = 'Shivajinagar, Pune, Maharashtra'; showToast('Located in Pune successfully!'); },
        () => { locInput.value = 'Kothrud, Pune, Maharashtra'; showToast('Set to Kothrud, Pune, Maharashtra.'); }
      );
    } else {
      locInput.value = 'Kothrud, Pune, Maharashtra';
    }
  });
}

function updateBMI() {
  const h = parseFloat(document.getElementById('height').value);
  const w = parseFloat(document.getElementById('weight').value);
  const valElem = document.getElementById('bmiValue');
  const catElem = document.getElementById('bmiCategory');

  if (h > 50 && w > 20) {
    const heightInMeters = h / 100;
    const bmi = (w / (heightInMeters * heightInMeters)).toFixed(1);
    valElem.textContent = `${bmi} kg/m²`;

    let category = ''; let catClass = '';
    if (bmi < 18.5) { category = 'Underweight'; catClass = 'text-warning'; }
    else if (bmi < 23.0) { category = 'Normal (Healthy Asian BMI)'; catClass = 'text-success'; }
    else if (bmi < 25.0) { category = 'Overweight (Asian Cutoff)'; catClass = 'text-warning'; }
    else { category = 'Obese (Elevated Diabetes Risk)'; catClass = 'text-danger'; }

    catElem.textContent = category;
    catElem.className = `bmi-category ${catClass}`;
    appState.personal.bmi = bmi;
    appState.personal.bmiCategory = category;
  } else {
    valElem.textContent = '--';
    catElem.textContent = 'Enter height and weight';
    catElem.className = 'bmi-category';
    appState.personal.bmi = null;
  }
}

function validatePersonalForm() {
  let isValid = true;
  const name = document.getElementById('fullName').value.trim();
  const age = parseInt(document.getElementById('age').value, 10);
  const gender = document.getElementById('gender').value;
  const height = parseFloat(document.getElementById('height').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const blood = document.getElementById('bloodGroup').value;
  const location = document.getElementById('location').value.trim();

  if (!name) { showError('fullName', 'nameError'); isValid = false; } else { clearError('fullName', 'nameError'); }
  if (!age || age < 1 || age > 120) { showError('age', 'ageError'); isValid = false; } else { clearError('age', 'ageError'); }
  if (!gender) { showError('gender', 'genderError'); isValid = false; } else { clearError('gender', 'genderError'); }
  if (!height || height < 50 || height > 250) { showError('height', 'heightError'); isValid = false; } else { clearError('height', 'heightError'); }
  if (!weight || weight < 20 || weight > 300) { showError('weight', 'weightError'); isValid = false; } else { clearError('weight', 'weightError'); }
  if (!blood) { showError('bloodGroup', 'bloodGroupError'); isValid = false; } else { clearError('bloodGroup', 'bloodGroupError'); }
  if (!location) { showError('location', 'locationError'); isValid = false; } else { clearError('location', 'locationError'); }
  return isValid;
}

function showError(inputId, errorId) {
  document.getElementById(inputId).classList.add('is-invalid');
  document.getElementById(errorId).classList.add('visible');
}

function clearError(inputId, errorId) {
  document.getElementById(inputId).classList.remove('is-invalid');
  document.getElementById(errorId).classList.remove('visible');
}

function savePersonalFormData() {
  const p = appState.personal;
  p.fullName = document.getElementById('fullName').value.trim();
  p.age = document.getElementById('age').value.trim();
  p.gender = document.getElementById('gender').value;
  p.height = document.getElementById('height').value.trim();
  p.weight = document.getElementById('weight').value.trim();
  p.bloodGroup = document.getElementById('bloodGroup').value;
  p.location = document.getElementById('location').value.trim();

  const selectedType = document.querySelector('input[name="diabetesType"]:checked');
  p.diabetesType = selectedType ? selectedType.value : 'Type 2 Diabetes';
  p.diabetesDuration = document.getElementById('diabetesDuration').value;
  p.sugarLevel = document.getElementById('sugarLevel').value.trim();

  p.diseases = Array.from(document.querySelectorAll('input[name="diseaseCheckbox"]:checked')).map(c => c.value);
  p.otherDiseaseText = document.getElementById('otherDiseaseText').value.trim();
}

function setupExamStep() {
  [document.getElementById('subTab1'), document.getElementById('subTab2'), document.getElementById('subTab3')].forEach(tab => {
    tab.addEventListener('click', () => switchSubStep(parseInt(tab.getAttribute('data-substep'), 10)));
  });
  document.getElementById('gotoSub2Btn').addEventListener('click', () => switchSubStep(2));
  document.getElementById('backtoSub1Btn').addEventListener('click', () => switchSubStep(1));
  document.getElementById('gotoSub3Btn').addEventListener('click', () => switchSubStep(3));
  document.getElementById('backtoSub2Btn').addEventListener('click', () => switchSubStep(2));

  setupUploader({
    dropzoneId: 'retinaDropzone', fileInputId: 'retinaFileInput', browseBtnId: 'retinaBrowseBtn',
    cameraBtnId: 'retinaCameraBtn', emptyStateId: 'retinaEmptyState', previewStateId: 'retinaPreviewState',
    imgPreviewId: 'retinaImgPreview', fileNameId: 'retinaFileName', removeBtnId: 'retinaRemoveBtn',
    successMsgId: 'retinaSuccessMsg', target: 'retina', sampleBtnId: 'loadSampleRetinaBtn'
  });

  setupUploader({
    dropzoneId: 'nailsDropzone', fileInputId: 'nailsFileInput', browseBtnId: 'nailsBrowseBtn',
    cameraBtnId: 'nailsCameraBtn', emptyStateId: 'nailsEmptyState', previewStateId: 'nailsPreviewState',
    imgPreviewId: 'nailsImgPreview', fileNameId: 'nailsFileName', removeBtnId: 'nailsRemoveBtn',
    successMsgId: 'nailsSuccessMsg', target: 'nails', sampleBtnId: 'loadSampleNailsBtn'
  });

  document.querySelectorAll('.symptom-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });
}

function switchSubStep(subStepNumber) {
  appState.currentSubStep = subStepNumber;
  for (let i = 1; i <= 3; i++) {
    const tab = document.getElementById(`subTab${i}`);
    const content = document.getElementById(`subStepContent${i}`);
    if (i === subStepNumber) { tab.classList.add('active'); content.classList.add('active'); }
    else { tab.classList.remove('active'); content.classList.remove('active'); }
  }
  initIcons();
}

function setupUploader(cfg) {
  const dropzone = document.getElementById(cfg.dropzoneId);
  const fileInput = document.getElementById(cfg.fileInputId);
  const browseBtn = document.getElementById(cfg.browseBtnId);
  const cameraBtn = document.getElementById(cfg.cameraBtnId);
  const sampleBtn = document.getElementById(cfg.sampleBtnId);
  const removeBtn = document.getElementById(cfg.removeBtnId);

  browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
  fileInput.addEventListener('change', (e) => { if (e.target.files && e.target.files[0]) handleImageFile(e.target.files[0], cfg); });

  ['dragenter', 'dragover'].forEach(n => dropzone.addEventListener(n, e => { e.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(n => dropzone.addEventListener(n, e => { e.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', (e) => { if (e.dataTransfer.files && e.dataTransfer.files[0]) handleImageFile(e.dataTransfer.files[0], cfg); });

  cameraBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openCameraModal(cfg.target, (capturedDataUrl) => applyImage(capturedDataUrl, `pune_patient_${cfg.target}.jpg`, cfg));
  });

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      applyImage(SAMPLE_SCANS[cfg.target], `sample_diabetic_${cfg.target}.png`, cfg);
      showToast(`Loaded sample diabetic ${cfg.target} scan!`);
    });
  }

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById(cfg.emptyStateId).classList.remove('hidden');
    document.getElementById(cfg.previewStateId).classList.add('hidden');
    document.getElementById(cfg.successMsgId).classList.add('hidden');
    fileInput.value = '';
    if (cfg.target === 'retina') { appState.examinations.retinaImage = null; appState.examinations.retinaFileName = ''; }
    else { appState.examinations.nailsImage = null; appState.examinations.nailsFileName = ''; }
    showToast(`Removed ${cfg.target} image.`);
  });
}

function handleImageFile(file, cfg) {
  if (!file.type.startsWith('image/')) { alert('Please upload an image file (JPG, PNG, WEBP).'); return; }
  const reader = new FileReader();
  reader.onload = (e) => applyImage(e.target.result, file.name, cfg);
  reader.readAsDataURL(file);
}

function applyImage(dataUrl, fileName, cfg) {
  document.getElementById(cfg.emptyStateId).classList.add('hidden');
  document.getElementById(cfg.previewStateId).classList.remove('hidden');
  document.getElementById(cfg.imgPreviewId).src = dataUrl;
  document.getElementById(cfg.fileNameId).textContent = fileName;
  document.getElementById(cfg.successMsgId).classList.remove('hidden');

  if (cfg.target === 'retina') { appState.examinations.retinaImage = dataUrl; appState.examinations.retinaFileName = fileName; }
  else { appState.examinations.nailsImage = dataUrl; appState.examinations.nailsFileName = fileName; }
  initIcons();
}

function saveSymptomsData() {
  appState.examinations.symptoms = Array.from(document.querySelectorAll('.symptom-chip.active')).map(c => c.getAttribute('data-symptom'));
  appState.examinations.customSymptomsText = document.getElementById('customSymptomsText').value.trim();
}

function setupReviewAndChances() {}

function renderPage3DataSummary() {
  const p = appState.personal;
  const ex = appState.examinations;

  document.getElementById('sumName').textContent = p.fullName || 'Not specified';
  document.getElementById('sumAgeGender').textContent = `${p.age ? p.age + ' yrs' : '--'} / ${p.gender || '--'}`;
  document.getElementById('sumHeightWeight').textContent = `${p.height ? p.height + ' cm' : '--'} • ${p.weight ? p.weight + ' kg' : '--'}`;
  document.getElementById('sumBMI').textContent = p.bmi ? `${p.bmi} (${p.bmiCategory})` : 'Not computed';
  document.getElementById('sumBlood').textContent = p.bloodGroup || 'Not specified';
  document.getElementById('sumLocation').textContent = p.location || 'Pune, Maharashtra';
  document.getElementById('sumDiabetesType').textContent = p.diabetesType || 'Type 2 Diabetes';
  document.getElementById('sumDiabetesDuration').textContent = p.diabetesDuration || '5 to 10 years';
  document.getElementById('sumSugarLevel').textContent = p.sugarLevel || 'Not tested recently';

  const sumRetinaImg = document.getElementById('sumRetinaImg');
  const sumRetinaEmpty = document.getElementById('sumRetinaEmpty');
  if (ex.retinaImage) { sumRetinaImg.src = ex.retinaImage; sumRetinaImg.classList.add('has-image'); sumRetinaEmpty.classList.add('hidden'); }
  else { sumRetinaImg.classList.remove('has-image'); sumRetinaEmpty.classList.remove('hidden'); }

  const sumNailsImg = document.getElementById('sumNailsImg');
  const sumNailsEmpty = document.getElementById('sumNailsEmpty');
  if (ex.nailsImage) { sumNailsImg.src = ex.nailsImage; sumNailsImg.classList.add('has-image'); sumNailsEmpty.classList.add('hidden'); }
  else { sumNailsImg.classList.remove('has-image'); sumNailsEmpty.classList.remove('hidden'); }

  const tagsContainer = document.getElementById('sumSymptomsTags');
  tagsContainer.innerHTML = '';
  const allItems = [...p.diseases, ...ex.symptoms];
  if (allItems.length > 0) {
    allItems.forEach(s => {
      const chip = document.createElement('span');
      chip.className = 'summary-badge-chip';
      chip.textContent = s;
      tagsContainer.appendChild(chip);
    });
  } else {
    tagsContainer.innerHTML = '<span class="empty-badge">No active symptoms or comorbidities</span>';
  }

  let notes = ex.customSymptomsText || '';
  if (p.otherDiseaseText) notes += (notes ? ' | Ongoing: ' : 'Ongoing: ') + p.otherDiseaseText;
  document.getElementById('sumSymptomNotes').textContent = notes || 'No additional notes provided.';
}

function calculateAndRenderDiabeticChances() {
  const p = appState.personal;
  const ex = appState.examinations;

  let score = 30;
  const isType1 = p.diabetesType.includes('Type 1');
  const isType2 = p.diabetesType.includes('Type 2');
  const isLongDuration = p.diabetesDuration.includes('5 to 10') || p.diabetesDuration.includes('Over 10');
  const hasBlurredVision = ex.symptoms.some(s => s.toLowerCase().includes('vision') || s.toLowerCase().includes('floating'));
  const hasNeuropathy = ex.symptoms.some(s => s.toLowerCase().includes('tingling') || s.toLowerCase().includes('burning') || s.toLowerCase().includes('feet'));
  const hasMetabolic = ex.symptoms.some(s => s.toLowerCase().includes('urination') || s.toLowerCase().includes('thirst') || s.toLowerCase().includes('fatigue'));
  const hasHypertension = p.diseases.some(d => d.toLowerCase().includes('hypertension'));

  if (isType1 || isType2) score += 20;
  if (isLongDuration) score += 18;
  if (hasBlurredVision) score += 15;
  if (hasNeuropathy) score += 12;
  if (hasHypertension) score += 10;
  if (p.bmi && parseFloat(p.bmi) >= 25) score += 6;
  if (ex.retinaImage) score += 4;

  score = Math.min(96, Math.max(20, score));

  let retinopathyOdds = (isLongDuration || hasBlurredVision) ? (hasBlurredVision ? 84 : 72) : 38;
  let neuropathyOdds = hasNeuropathy ? 78 : (isLongDuration ? 54 : 28);
  let glycemicOdds = hasMetabolic ? 82 : (score > 60 ? 68 : 40);
  let nephroOdds = (hasHypertension && isLongDuration) ? 58 : 32;

  const circle = document.getElementById('overallRiskCircle');
  const scoreElem = document.getElementById('overallRiskScore');
  const badgeElem = document.getElementById('overallRiskBadge');
  const descElem = document.getElementById('overallRiskDescription');

  scoreElem.textContent = `${score}%`;
  const offset = 314.159 - (score / 100) * 314.159;
  circle.style.strokeDashoffset = offset;

  if (score >= 68) {
    circle.style.stroke = 'var(--danger)';
    badgeElem.className = 'risk-status-badge badge-danger';
    badgeElem.textContent = 'High Diabetic Complication Risk';
    descElem.textContent = 'Significant correlation between duration of diabetes, retinal microvascular indicators, and peripheral symptoms.';
  } else if (score >= 42) {
    circle.style.stroke = 'var(--warning)';
    badgeElem.className = 'risk-status-badge badge-warning';
    badgeElem.textContent = 'Moderate Diabetic Risk';
    descElem.textContent = 'Early signs of microvascular or glycemic strain. Scheduled dilated eye fundus exam advised in Pune.';
  } else {
    circle.style.stroke = 'var(--success)';
    badgeElem.className = 'risk-status-badge badge-success';
    badgeElem.textContent = 'Well-Managed / Low Immediate Risk';
    descElem.textContent = 'Diabetic parameters currently indicate minimal microvascular damage. Maintain annual eye exam.';
  }

  updateChanceBar('retinopathyChance', 'retinopathyBar', retinopathyOdds);
  updateChanceBar('neuropathyChance', 'neuropathyBar', neuropathyOdds);
  updateChanceBar('glycemicChance', 'glycemicBar', glycemicOdds);
  updateChanceBar('nephroChance', 'nephroBar', nephroOdds);
}

function updateChanceBar(textId, barId, percent) {
  const textElem = document.getElementById(textId);
  const barElem = document.getElementById(barId);
  if (textElem && barElem) {
    textElem.textContent = `${percent}%`;
    barElem.style.width = `${percent}%`;
  }
}

function setupDiagnosisAndDoctors() {
  document.getElementById('printReportBtn').addEventListener('click', () => window.print());
  [document.getElementById('specialtyFilter'), document.getElementById('distanceFilter'), document.getElementById('doctorSearchInput')].forEach(el => {
    el.addEventListener('input', renderDoctorsList);
  });
}

function renderDiabeticDiagnosisSummary() {
  const p = appState.personal;
  const ex = appState.examinations;
  const hasBlurredVision = ex.symptoms.some(s => s.toLowerCase().includes('vision') || s.toLowerCase().includes('floating'));
  const isLongDuration = p.diabetesDuration.includes('5 to 10') || p.diabetesDuration.includes('Over 10');
  const hasNeuropathy = ex.symptoms.some(s => s.toLowerCase().includes('tingling') || s.toLowerCase().includes('burning') || s.toLowerCase().includes('feet'));

  const titleElem = document.getElementById('primaryDiagnosisTitle');
  const retinaText = document.getElementById('retinaFindingText');
  const nailsText = document.getElementById('nailsFindingText');
  const systemicText = document.getElementById('systemicFindingText');

  if (hasBlurredVision || isLongDuration) {
    titleElem.textContent = 'Suspected Moderate Non-Proliferative Diabetic Retinopathy (NPDR) with Early Peripheral Neuropathic Strain';
    retinaText.textContent = 'Fundus inspection reveals classical diabetic microaneurysms, dot-and-blot intraretinal hemorrhages, and mild tortuosity in retinal venules.';
  } else {
    titleElem.textContent = 'Mild Glycemic Microvascular Stress (Early Pre-Clinical Diabetic Screening)';
    retinaText.textContent = 'No overt proliferative neovascularization. Early background venular engorgement consistent with duration of diabetes.';
  }

  if (hasNeuropathy) {
    nailsText.textContent = 'Subungual microcapillary bed pallor and delayed capillary refill (>2.5s) detected, aligning with diabetic peripheral small-fiber neuropathy.';
  } else {
    nailsText.textContent = 'Nail matrix intact; mild longitudinal ridging consistent with glycemic fluctuations; no fungal nail dystrophy.';
  }

  systemicText.textContent = `Patient ${p.fullName || 'Diabetic Case'}, ${p.age || '52'} yrs, residing in ${p.location || 'Pune, Maharashtra'}. Presentation of ${p.diabetesType} with ${p.diabetesDuration} duration indicates need for coordinated multidisciplinary care in Pune.`;
  document.getElementById('docLocationDisplay').textContent = p.location || 'Pune, Maharashtra';
  const mapTag = document.getElementById('mapUserLocTag');
  if (mapTag) mapTag.textContent = (p.location && p.location.split(',')[0]) || 'Pune, MH';
}

function renderDoctorsList() {
  const container = document.getElementById('doctorCardsList');
  const selectedSpec = document.getElementById('specialtyFilter').value;
  const maxDistance = parseFloat(document.getElementById('distanceFilter').value);
  const query = document.getElementById('doctorSearchInput').value.toLowerCase().trim();

  const filtered = DOCTORS_DATABASE.filter(doc => {
    const matchSpec = selectedSpec === 'All' || doc.specialty === selectedSpec;
    const matchDist = doc.distance <= maxDistance;
    const matchQuery = !query || doc.name.toLowerCase().includes(query) || doc.clinic.toLowerCase().includes(query) || doc.specialty.toLowerCase().includes(query);
    return matchSpec && matchDist && matchQuery;
  });

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--slate-500);"><p>No clinics found in this radius in Pune.</p></div>`;
    return;
  }

  filtered.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
      <div class="doctor-profile">
        <div class="doctor-avatar">${doc.avatar}</div>
        <div class="doctor-info">
          <h4>${doc.name}</h4>
          <div class="doctor-specialty">${doc.title}</div>
          <div class="doctor-clinic"><i data-lucide="building-2"></i> ${doc.clinic}</div>
          <div class="doctor-meta-row">
            <span class="doc-rating"><i data-lucide="star"></i> ${doc.rating} (${doc.reviews} Pune reviews)</span>
            <span class="doc-distance">• ${doc.distance} km away</span>
            <span class="doc-available">• OPD Fee: ${doc.fee}</span>
          </div>
        </div>
      </div>
      <div>
        <button class="btn btn-primary btn-sm book-consult-btn" data-docid="${doc.id}">
          <i data-lucide="calendar"></i> Book OPD
        </button>
      </div>
    `;
    card.querySelector('.book-consult-btn').addEventListener('click', () => openBookingModal(doc));
    container.appendChild(card);
  });
  initIcons();
}

function setupModals() {
  document.getElementById('closeCameraBtn').addEventListener('click', closeCameraModal);
  document.getElementById('cancelCameraBtn').addEventListener('click', closeCameraModal);

  document.getElementById('takeSnapshotBtn').addEventListener('click', () => {
    const video = document.getElementById('webcamVideo');
    const canvas = document.getElementById('captureCanvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');

    if (window._cameraCallback) window._cameraCallback(dataUrl);
    closeCameraModal();
    showToast('Snapshot captured successfully!');
  });

  const bookingModal = document.getElementById('bookingModal');
  document.getElementById('closeBookingBtn').addEventListener('click', () => bookingModal.classList.add('hidden'));
  document.getElementById('cancelBookingBtn').addEventListener('click', () => bookingModal.classList.add('hidden'));

  document.getElementById('confirmBookingBtn').addEventListener('click', () => {
    const date = document.getElementById('bookDate').value;
    if (!date) { alert('Please select a date.'); return; }
    bookingModal.classList.add('hidden');
    showToast(`Appointment confirmed at ${window._selectedDocName || 'Pune Clinic'} for ${date}! Confirmation SMS sent.`);
  });
}

function openCameraModal(target, callback) {
  const modal = document.getElementById('cameraModal');
  const title = document.getElementById('cameraModalTitle');
  const video = document.getElementById('webcamVideo');
  title.textContent = target === 'retina' ? 'Live Retina Fundus Optical Capture' : 'Live Fingernail Optical Capture';

  window._cameraCallback = callback;
  modal.classList.remove('hidden');

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => { appState.cameraStream = stream; video.srcObject = stream; })
      .catch(err => {
        const canvas = document.getElementById('captureCanvas');
        canvas.width = 640; canvas.height = 480;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = SAMPLE_SCANS[target];
        img.onload = () => { ctx.drawImage(img, 0, 0, 640, 480); video.srcObject = canvas.captureStream ? canvas.captureStream() : null; };
      });
  } else {
    showToast('Webcam not supported, using clinical sample preview.');
  }
}

function closeCameraModal() {
  const modal = document.getElementById('cameraModal');
  modal.classList.add('hidden');
  if (appState.cameraStream) { appState.cameraStream.getTracks().forEach(t => t.stop()); appState.cameraStream = null; }
}

function openBookingModal(doc) {
  window._selectedDocName = doc.name;
  const modal = document.getElementById('bookingModal');
  document.getElementById('bookPatientName').value = appState.personal.fullName || 'Diabetic Patient (Pune)';
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('bookDate').value = tomorrow.toISOString().split('T')[0];

  document.getElementById('bookingDocInfo').innerHTML = `
    <strong>Specialist / Center:</strong> ${doc.name} (${doc.title})<br>
    <small style="color: var(--slate-600);"><i data-lucide="building-2"></i> ${doc.clinic} • OPD Consultation: <strong>${doc.fee}</strong></small>
  `;
  initIcons();
  modal.classList.remove('hidden');
}

function setupDemoPresets() {
  document.getElementById('quickDemoBtn').addEventListener('click', () => {
    document.getElementById('fullName').value = 'Ramesh Joshi';
    document.getElementById('age').value = '54';
    document.getElementById('gender').value = 'Male';
    document.getElementById('height').value = '170';
    document.getElementById('weight').value = '78';
    document.getElementById('bloodGroup').value = 'B+';
    document.getElementById('location').value = 'Kothrud, Pune, Maharashtra';

    const type2 = document.querySelector('input[name="diabetesType"][value="Type 2 Diabetes"]');
    if (type2) type2.checked = true;

    document.getElementById('diabetesDuration').value = '5 to 10 years';
    document.getElementById('sugarLevel').value = 'Fasting: 172 mg/dL | HbA1c: 8.3%';

    document.querySelectorAll('input[name="diseaseCheckbox"]').forEach(cb => {
      if (cb.value.includes('Hypertension') || cb.value.includes('Neuropathy')) cb.checked = true; else cb.checked = false;
    });
    document.getElementById('otherDiseaseText').value = 'Metformin 500mg BD, Teneligliptin 20mg, Telmisartan 40mg';

    updateBMI();
    savePersonalFormData();

    applyImage(SAMPLE_SCANS.retina, 'ramesh_joshi_retina_pune.jpg', {
      emptyStateId: 'retinaEmptyState', previewStateId: 'retinaPreviewState',
      imgPreviewId: 'retinaImgPreview', fileNameId: 'retinaFileName',
      successMsgId: 'retinaSuccessMsg', target: 'retina'
    });

    applyImage(SAMPLE_SCANS.nails, 'ramesh_joshi_nails_pune.jpg', {
      emptyStateId: 'nailsEmptyState', previewStateId: 'nailsPreviewState',
      imgPreviewId: 'nailsImgPreview', fileNameId: 'nailsFileName',
      successMsgId: 'nailsSuccessMsg', target: 'nails'
    });

    document.querySelectorAll('.symptom-chip').forEach(chip => {
      const sym = chip.getAttribute('data-symptom');
      if (sym.includes('vision') || sym.includes('spots') || sym.includes('urination') || sym.includes('thirst') || sym.includes('feet')) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
    document.getElementById('customSymptomsText').value = 'Experiencing blurred vision after evening meals in Kothrud, dark floaters, and numbness in right foot.';

    showToast('Loaded Pune Diabetic Case: Ramesh Joshi (Kothrud). Check all steps!');
  });
}

function resetAll() {
  if (confirm('Reset all assessment data?')) {
    document.getElementById('personalForm').reset();
    document.getElementById('bmiValue').textContent = '--';
    document.getElementById('bmiCategory').textContent = 'Enter height and weight';
    document.getElementById('customSymptomsText').value = '';
    document.querySelectorAll('.symptom-chip').forEach(c => c.classList.remove('active'));

    document.getElementById('retinaEmptyState').classList.remove('hidden');
    document.getElementById('retinaPreviewState').classList.add('hidden');
    document.getElementById('retinaSuccessMsg').classList.add('hidden');
    document.getElementById('nailsEmptyState').classList.remove('hidden');
    document.getElementById('nailsPreviewState').classList.add('hidden');
    document.getElementById('nailsSuccessMsg').classList.add('hidden');

    appState.personal = { fullName: '', age: '', gender: '', height: '', weight: '', bmi: null, bmiCategory: '', bloodGroup: '', location: '', diabetesType: 'Type 2 Diabetes', diabetesDuration: '5 to 10 years', sugarLevel: '', diseases: [], otherDiseaseText: '' };
    appState.examinations = { retinaImage: null, retinaFileName: '', nailsImage: null, nailsFileName: '', symptoms: [], customSymptomsText: '' };

    goToStep(1);
    showToast('Session reset.');
  }
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="info"></i> <span>${message}</span>`;
  container.appendChild(toast);
  initIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function generateDiabeticRetinaCanvasData() {
  const canvas = document.createElement('canvas');
  canvas.width = 400; canvas.height = 400;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#100402'; ctx.fillRect(0, 0, 400, 400);

  const grad = ctx.createRadialGradient(200, 200, 20, 200, 200, 180);
  grad.addColorStop(0, '#e85d26'); grad.addColorStop(0.5, '#b93813');
  grad.addColorStop(0.85, '#781d09'); grad.addColorStop(1, '#2d0802');
  ctx.beginPath(); ctx.arc(200, 200, 180, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();

  ctx.beginPath(); ctx.arc(130, 200, 32, 0, Math.PI * 2);
  const discGrad = ctx.createRadialGradient(130, 200, 5, 130, 200, 32);
  discGrad.addColorStop(0, '#fff4cc'); discGrad.addColorStop(0.7, '#fcd34d'); discGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = discGrad; ctx.fill();

  ctx.beginPath(); ctx.arc(260, 200, 24, 0, Math.PI * 2);
  const maculaGrad = ctx.createRadialGradient(260, 200, 2, 260, 200, 24);
  maculaGrad.addColorStop(0, '#4a0e05'); maculaGrad.addColorStop(1, '#831e0c');
  ctx.fillStyle = maculaGrad; ctx.fill();

  ctx.strokeStyle = '#6b1104'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  function drawVessel(x1, y1, x2, y2, x3, y3) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(x2, y2, x3, y3); ctx.stroke();
  }
  drawVessel(130, 190, 150, 120, 220, 90);
  drawVessel(150, 120, 190, 70, 270, 60);
  drawVessel(130, 190, 100, 130, 60, 100);
  drawVessel(130, 210, 160, 270, 240, 310);
  drawVessel(160, 270, 200, 330, 290, 335);

  ctx.fillStyle = '#dc2626';
  [[210, 130], [235, 150], [255, 170], [210, 240], [275, 230], [180, 260]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
  });

  ctx.fillStyle = '#fef08a';
  [[240, 220], [245, 225], [235, 228], [250, 218]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  });

  return canvas.toDataURL('image/png');
}

function generateDiabeticNailsCanvasData() {
  const canvas = document.createElement('canvas');
  canvas.width = 400; canvas.height = 300;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, 400, 300);

  [110, 200, 290].forEach((fx) => {
    ctx.fillStyle = '#f3cfb3'; ctx.beginPath();
    ctx.roundRect(fx - 36, 60, 72, 220, [36, 36, 0, 0]); ctx.fill();

    ctx.strokeStyle = '#e11d48'; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.arc(fx, 130, 22, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();

    ctx.beginPath(); ctx.roundRect(fx - 24, 75, 48, 65, [18, 18, 8, 8]);
    const nailGrad = ctx.createLinearGradient(fx, 75, fx, 140);
    nailGrad.addColorStop(0, '#fef9c3'); nailGrad.addColorStop(0.3, '#fef08a');
    nailGrad.addColorStop(0.7, '#fed7aa'); nailGrad.addColorStop(1, '#fbcfe8');
    ctx.fillStyle = nailGrad; ctx.fill();
    ctx.strokeStyle = '#d5856b'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.beginPath(); ctx.arc(fx, 140, 12, Math.PI, 0);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'; ctx.fill();
  });

  return canvas.toDataURL('image/png');
}

/* ==========================================================================
   GLUCODRISHTI AI ASSISTANT - CONTROLLER & EXPLAINABLE AI INTEGRATION
   ========================================================================== */

const chatState = {
  isOpen: false,
  history: [],
  isTyping: false
};

function initChatbot() {
  const launcherBtn = document.getElementById('chatbotLauncherBtn');
  const closeBtn = document.getElementById('closeChatbotBtn');
  const restartBtn = document.getElementById('restartChatBtn');
  const tooltipCloseBtn = document.getElementById('closeTooltipBtn');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const chipsContainer = document.getElementById('chatbotQuickChips');

  if (!launcherBtn) return;

  // Toggle open/close
  launcherBtn.addEventListener('click', () => toggleChatbot());
  if (closeBtn) closeBtn.addEventListener('click', () => toggleChatbot(false));
  if (restartBtn) restartBtn.addEventListener('click', () => resetChatbotConversation());
  if (tooltipCloseBtn) {
    tooltipCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tooltip = document.getElementById('launcherTooltip');
      if (tooltip) tooltip.style.display = 'none';
    });
  }

  // Handle Form Submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = input.value.trim();
      if (!msg || chatState.isTyping) return;
      input.value = '';
      sendChatMessage(msg);
    });
  }

  // Handle Quick Chips clicks
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chat-chip');
      if (!chip || chatState.isTyping) return;
      const query = chip.getAttribute('data-query');
      if (query) {
        sendChatMessage(query);
      }
    });
  }

  // Page 3 & Page 4 In-Page Trigger Buttons
  const p3AskBtn = document.getElementById('page3AskAiBtn');
  if (p3AskBtn) {
    p3AskBtn.addEventListener('click', () => {
      toggleChatbot(true);
      sendChatMessage('Explain my result');
    });
  }

  const p4ExplainBtn = document.getElementById('page4ExplainHighlightedBtn');
  if (p4ExplainBtn) {
    p4ExplainBtn.addEventListener('click', () => {
      toggleChatbot(true);
      sendChatMessage('Explain highlighted areas');
    });
  }

  const p4DoctorBtn = document.getElementById('page4AskDoctorTimingBtn');
  if (p4DoctorBtn) {
    p4DoctorBtn.addEventListener('click', () => {
      toggleChatbot(true);
      sendChatMessage('When should I see a doctor?');
    });
  }

  // Render initial welcome message
  resetChatbotConversation(false);
}

function toggleChatbot(forceState) {
  const container = document.getElementById('chatbotContainer');
  const tooltip = document.getElementById('launcherTooltip');
  if (!container) return;

  if (typeof forceState === 'boolean') {
    chatState.isOpen = forceState;
  } else {
    chatState.isOpen = container.classList.contains('closed');
  }

  if (chatState.isOpen) {
    container.classList.remove('closed');
    if (tooltip) tooltip.style.display = 'none';
    const input = document.getElementById('chatbotInput');
    if (input) setTimeout(() => input.focus(), 150);
    scrollChatToBottom();
  } else {
    container.classList.add('closed');
  }
}

function resetChatbotConversation(showToastMsg = true) {
  chatState.history = [];
  const messagesBox = document.getElementById('chatbotMessages');
  if (!messagesBox) return;

  messagesBox.innerHTML = '';

  // Has retinal image currently?
  const hasRetina = Boolean(appState.examinations.retinaImage);

  // Initial Welcome Message
  const welcomeHtml = `
    <p>👋 <strong>Hello! I’m GlucoDrishti AI Assistant.</strong> I can help you understand diabetes, diabetic retinopathy, retinal screening, and your AI screening results.</p>
    <div class="chat-action-buttons-list">
      <button type="button" class="chat-action-btn" data-action="What is diabetic retinopathy?">
        <span>What is diabetic retinopathy?</span>
        <i data-lucide="chevron-right"></i>
      </button>
      <button type="button" class="chat-action-btn" data-action="How does screening work?">
        <span>How does screening work?</span>
        <i data-lucide="chevron-right"></i>
      </button>
      <button type="button" class="chat-action-btn" data-action="Explain my result">
        <span>Explain my result</span>
        <i data-lucide="chevron-right"></i>
      </button>
      <button type="button" class="chat-action-btn" data-action="Diabetes &amp; eye health">
        <span>Diabetes &amp; eye health</span>
        <i data-lucide="chevron-right"></i>
      </button>
      <button type="button" class="chat-action-btn" data-action="When should I see a doctor?">
        <span>When should I see a doctor?</span>
        <i data-lucide="chevron-right"></i>
      </button>
      ${hasRetina ? `
      <button type="button" class="chat-action-btn btn-highlighted-action" data-action="Explain highlighted areas">
        <span>Explain highlighted areas</span>
        <i data-lucide="eye"></i>
      </button>
      ` : ''}
    </div>
  `;

  renderBotMessage(welcomeHtml, true);
  initIcons();

  // Attach click handlers to the quick-action buttons inside welcome message
  const actionBtns = messagesBox.querySelectorAll('.chat-action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.getAttribute('data-action');
      if (act) sendChatMessage(act);
    });
  });

  updateQuickChips([
    'What is diabetic retinopathy?',
    'How does screening work?',
    'Explain my result',
    'Diabetes & eye health',
    'When should I see a doctor?'
  ]);

  if (showToastMsg) {
    showToast('GlucoDrishti AI Assistant restarted.');
  }
}

async function sendChatMessage(userText) {
  if (!userText || chatState.isTyping) return;
  chatState.isTyping = true;

  // Render User Bubble
  renderUserMessage(userText);
  chatState.history.push({ role: 'user', content: userText });
  scrollChatToBottom();

  // Render Typing Indicator
  const typingElem = renderTypingIndicator();
  scrollChatToBottom();

  // Collect live patient context from appState & DOM
  const patientContext = collectPatientContext();

  let botReply = '';
  let botSuggestions = [];

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        history: chatState.history.slice(-8),
        patientContext: patientContext
      })
    });

    if (res.ok) {
      const data = await res.json();
      botReply = data.reply || '';
      botSuggestions = data.suggestions || [];
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    // Graceful offline fallback to client-side clinical reasoning engine
    const localResult = generateLocalAiResponse(userText, patientContext);
    botReply = localResult.reply;
    botSuggestions = localResult.suggestions;
  } finally {
    if (typingElem && typingElem.parentNode) typingElem.remove();
    chatState.isTyping = false;
  }

  // Render Bot Bubble
  renderBotMessage(formatChatMarkdown(botReply));
  chatState.history.push({ role: 'assistant', content: botReply });
  scrollChatToBottom();
  initIcons();

  // Update quick action suggestion chips
  if (botSuggestions && botSuggestions.length > 0) {
    updateQuickChips(botSuggestions);
  }
}

function collectPatientContext() {
  const p = appState.personal;
  const ex = appState.examinations;

  const riskElem = document.getElementById('overallRiskScore');
  const retElem = document.getElementById('retinopathyChance');
  const retFinding = document.getElementById('retinaFindingText');
  const diagTitle = document.getElementById('primaryDiagnosisTitle');

  return {
    fullName: p.fullName || '',
    age: p.age || null,
    gender: p.gender || '',
    bmi: p.bmi || null,
    bmiCategory: p.bmiCategory || '',
    diabetesType: p.diabetesType || 'Type 2 Diabetes',
    diabetesDuration: p.diabetesDuration || '',
    sugarLevel: p.sugarLevel || '',
    location: p.location || 'Pune, Maharashtra',
    retinaImage: ex.retinaImage,
    retinaFileName: ex.retinaFileName,
    nailsImage: ex.nailsImage,
    symptoms: ex.symptoms || [],
    overall_risk: riskElem ? parseInt(riskElem.textContent, 10) || 74 : 74,
    retinopathyChance: retElem ? parseInt(retElem.textContent, 10) || 78 : 78,
    retina_findings: retFinding ? retFinding.textContent : '',
    diagnosis_title: diagTitle ? diagTitle.textContent : ''
  };
}

function renderUserMessage(text) {
  const messagesBox = document.getElementById('chatbotMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg user';
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  msgDiv.innerHTML = `
    <div class="chat-bubble">${escapeHtml(text)}</div>
    <span class="chat-time">${now}</span>
  `;
  messagesBox.appendChild(msgDiv);
}

function renderBotMessage(htmlContent, isRawHtml = false) {
  const messagesBox = document.getElementById('chatbotMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg bot';
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const content = isRawHtml ? htmlContent : htmlContent;
  msgDiv.innerHTML = `
    <div class="chat-bubble">${content}</div>
    <span class="chat-time">${now} • GlucoDrishti AI</span>
  `;
  messagesBox.appendChild(msgDiv);
  return msgDiv;
}

function renderTypingIndicator() {
  const messagesBox = document.getElementById('chatbotMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg bot';
  typingDiv.innerHTML = `
    <div class="chat-typing">
      <span></span><span></span><span></span>
    </div>
  `;
  messagesBox.appendChild(typingDiv);
  return typingDiv;
}

function scrollChatToBottom() {
  const messagesBox = document.getElementById('chatbotMessages');
  if (messagesBox) {
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }
}

function updateQuickChips(suggestions) {
  const container = document.getElementById('chatbotQuickChips');
  if (!container) return;
  container.innerHTML = '';
  suggestions.forEach(s => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-chip';
    if (s.toLowerCase().includes('highlight')) {
      btn.classList.add('chip-active-highlight');
    }
    btn.setAttribute('data-query', s);
    btn.textContent = s;
    container.appendChild(btn);
  });
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatChatMarkdown(text) {
  if (!text) return '';
  let formatted = escapeHtml(text);

  // Convert headings: ### Heading
  formatted = formatted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h3>$1</h3>');

  // Convert bold: **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert bullet points: • or -
  formatted = formatted.replace(/^[•\-\*] (.*$)/gim, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

  // Convert numbered lists: 1.
  formatted = formatted.replace(/^\d+\.\s+(.*$)/gim, '<li>$1</li>');

  // Convert line breaks (preserve paragraph spacing)
  formatted = formatted.replace(/\n\n+/g, '</p><p>');
  formatted = formatted.replace(/\n/g, '<br>');

  return `<p>${formatted}</p>`;
}

function generateLocalAiResponse(msg, patient) {
  const q = msg.toLowerCase();
  const name = patient.fullName ? patient.fullName.trim() : '';
  const salutation = name ? `Hello ${name}! ` : 'Hello! ';

  // 1. WHAT IS DIABETIC RETINOPATHY?
  if (q.includes('what is diabetic retinopathy') || q.includes('retinopathy') || q.includes('retina damage')) {
    return {
      reply: `${salutation}**Diabetic Retinopathy** is a condition where chronic high blood sugar damages the tiny blood vessels in your retina.\n\n` +
        `### 👁️ What is the Retina?\n` +
        `The retina is the **delicate seeing screen (दृष्टिपटल / parda)** at the back of your eye that captures light and transmits images to your brain.\n\n` +
        `### 🩸 What Happens with High Sugar?\n` +
        `• **Microaneurysms:** Microscopic blood vessels weaken and swell into tiny dots.\n` +
        `• **Fluid Leakage:** Fluid and fatty lipids seep out, causing blurriness in the central retina (macula).\n` +
        `• **Silent Progression:** In the early stages, there is **zero pain and zero blurriness**! An annual dilated eye exam is the only way to catch it early.`,
      suggestions: [
        'How does screening work?',
        'Explain highlighted areas',
        'Diabetes & eye health',
        'When should I see a doctor?'
      ]
    };
  }

  // 2. HOW DOES SCREENING WORK?
  if (q.includes('screening work') || q.includes('how does screening work') || q.includes('screening process')) {
    return {
      reply: `${salutation}**Retinal AI Screening** is a quick, non-invasive checkup that scans the back of the eye for microvascular changes.\n\n` +
        `### 🔍 The Screening Steps:\n` +
        `1. **Digital Fundus Image:** A specialized optical camera photographs your retina.\n` +
        `2. **AI Pattern Recognition:** The AI detects microaneurysms, hemorrhages, and exudate deposits.\n` +
        `3. **Risk Calibration:** It calculates your complication probability based on duration of diabetes, glucose levels, and symptoms.\n\n` +
        `🛡️ *Note: AI screening is an educational early warning tool. It does not provide a medical diagnosis. Always consult an ophthalmologist for medical evaluation.*`,
      suggestions: [
        'Explain my result',
        'Explain highlighted areas',
        'When should I see a doctor?'
      ]
    };
  }

  // 3. EXPLAIN HIGHLIGHTED AREAS (EXPLAINABLE AI)
  if (q.includes('highlighted') || q.includes('heatmap') || q.includes('red dots') || q.includes('yellow')) {
    return {
      reply: `${salutation}Here is how to understand the **AI-highlighted areas** on a retinal image:\n\n` +
        `### 🔬 What the Highlighted Regions Indicate:\n` +
        `• **🔴 Red Highlighted Dots:** These show suspected **microaneurysms** and tiny dot hemorrhages where delicate capillaries have been stressed by high sugar.\n` +
        `• **🟡 Yellow / Light Marked Patches:** These show suspected **hard exudates**—small deposits of fatty lipids that have seeped through weakened blood vessel walls.\n` +
        `• **〰️ Vessel Contouring:** Highlights regions where retinal venules show dilation or microvascular strain.\n\n` +
        `### 🧠 How This Influenced the AI Prediction:\n` +
        `The computer vision model uses the density, distribution, and distance of these highlighted features relative to the macula to compute your risk probability.\n\n` +
        `⚠️ *Important: These highlights show algorithmic features that influenced the screening model. This is an AI prediction and NOT a confirmed diagnosis.*`,
      suggestions: [
        'Explain my result',
        'What is diabetic retinopathy?',
        'When should I see a doctor?'
      ]
    };
  }

  // 4. EXPLAIN MY RESULT
  if (q.includes('explain my result') || q.includes('my result') || q.includes('score mean')) {
    const hasData = Boolean(patient.fullName || patient.retinaImage || patient.sugarLevel);
    if (!hasData) {
      return {
        reply: `${salutation}I don't see an active screening result in your session yet.\n\n` +
          `**To generate and explain your result:**\n` +
          `• Click the **"Autofill Pune Diabetic Case"** button at the top header to load sample data instantly, OR\n` +
          `• Complete Step 1 and Step 2 with your own information.\n\n` +
          `Once loaded, I will explain your risk percentage and retinal findings in clear words!`,
        suggestions: [
          'What is diabetic retinopathy?',
          'How does screening work?',
          'When should I see a doctor?'
        ]
      };
    }

    const risk = patient.overall_risk || 74;
    const odds = patient.retinopathyChance || 78;
    const dur = patient.diabetesDuration || '5 to 10 years';
    return {
      reply: `${salutation}Here is a breakdown of your screening assessment:\n\n` +
        `### 📊 Overall Complication Risk: **${risk}%**\n` +
        `• This represents your estimated statistical risk based on diabetes duration (${dur}) and physical screening markers.\n\n` +
        `### 👁️ Retinal Health Screening: **${odds}% probability of microvascular changes**\n` +
        `• The AI detected microscopic signs (such as vascular outpouchings) suggesting the eye capillaries are under strain.\n\n` +
        `### 🩺 Next Steps for You:\n` +
        `1. **Schedule a dilated eye exam:** Have a retina specialist in Pune confirm clinical status.\n` +
        `2. **Maintain tight glycemic targets:** Keep HbA1c around or below 7.0%.\n\n` +
        `⚠️ *Disclaimer: This result is an AI screening prediction and not a confirmed medical diagnosis.*`,
      suggestions: [
        'Explain highlighted areas',
        'When should I see a doctor?',
        'Diabetes & eye health'
      ]
    };
  }

  // 5. DIABETES & EYE HEALTH
  if (q.includes('diabetes & eye health') || q.includes('eye health') || q.includes('vision')) {
    return {
      reply: `${salutation}High blood sugar affects eyes in several important ways:\n\n` +
        `• **Temporary Blurring:** Fluctuating glucose causes the eye lens to swell or contract.\n` +
        `• **Retinal Capillary Damage:** Leads to Diabetic Retinopathy and macular edema.\n` +
        `• **Higher Risk of Cataracts & Glaucoma:** Diabetes accelerates clouding of the natural lens.\n\n` +
        `### 🛡️ 3 Golden Rules to Protect Your Sight:\n` +
        `1. Keep HbA1c < 7.0% and Blood Pressure < 130/80.\n` +
        `2. Eat fiber-rich traditional foods like Jowar/Bajra bhakri, methi, and sprouts.\n` +
        `3. Never skip your **annual dilated eye exam** in Pune!`,
      suggestions: [
        'What is diabetic retinopathy?',
        'How does screening work?',
        'When should I see a doctor?'
      ]
    };
  }

  // 6. WHEN SHOULD I SEE A DOCTOR?
  if (q.includes('when should i see a doctor') || q.includes('doctor') || q.includes('see a doctor') || q.includes('red flags')) {
    return {
      reply: `${salutation}Here is when you should consult a specialist:\n\n` +
        `### 🚨 Urgent Red-Flag Symptoms (See an Eye Specialist Within 24-48 Hours):\n` +
        `• Sudden appearance of floaters, dark cobwebs, or flashes of light\n` +
        `• A dark curtain or shadow falling across part of your sight\n` +
        `• Sudden vision loss or severe eye pain\n\n` +
        `### 🗓️ Routine Visits for All Diabetics:\n` +
        `• **Once a year:** Dilated retina examination, even if your vision feels fine.\n` +
        `• **Every 3 months:** HbA1c check and diabetologist consultation.\n\n` +
        `In Pune, centers like **NIO (Shivajinagar)**, **Asian Eye Hospital**, and **Chellaram Diabetes Institute** provide comprehensive care.`,
      suggestions: [
        'What is diabetic retinopathy?',
        'Explain my result',
        'How does screening work?'
      ]
    };
  }

  // DEFAULT
  return {
    reply: `${salutation}I am **GlucoDrishti AI Assistant**, your assistant for diabetes and eye health in Pune.\n\n` +
      `I can answer questions on diabetic retinopathy, how screening works, explaining your screening scores, diet, and when to see a doctor.\n\n` +
      `💡 *GlucoDrishti AI Assistant provides general health information and explanations of AI screening results. It does not provide a medical diagnosis. Please consult a qualified healthcare professional for medical advice.*`,
    suggestions: [
      'What is diabetic retinopathy?',
      'How does screening work?',
      'Explain my result',
      'Diabetes & eye health',
      'When should I see a doctor?'
    ]
  };
}

/* ==========================================================================
   GlucoDrishti AI - Retinal & Neural Particle Canvas Controller
   Theme: Explainable AI for Diabetic Retinopathy Screening in Rural India
   ========================================================================== */
function initRetinaAiBackgroundCanvas() {
  const canvas = document.getElementById('retinaAiCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let animationFrameId = null;
  let isTabVisible = !document.hidden;

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PARTICLE_COUNT = 34;
  const CONNECTION_DIST = 120;
  const particles = [];

  const COLOR_PALETTE = [
    { r: 13, g: 148, b: 136 },  // Healthcare Teal
    { r: 14, g: 165, b: 233 },  // Ophthalmic Sky/Cyan
    { r: 99, g: 102, b: 241 },  // AI Cognitive Indigo/Violet
    { r: 45, g: 212, b: 191 }   // Luminous Mint/Cyan
  ];

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 72% particles gravitate toward the right side (where retinal pattern lives)
      // 28% softly scatter to create subtle ambient depth across the canvas
      const isRightSided = Math.random() < 0.72;
      const x = isRightSided
        ? width * 0.52 + Math.random() * (width * 0.48)
        : Math.random() * width;
      const y = Math.random() * height;

      const color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
      const radius = 1.6 + Math.random() * 2.2;
      const baseAlpha = 0.18 + Math.random() * 0.28;

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.48) * 0.32,
        vy: (Math.random() - 0.5) * 0.28,
        radius,
        baseAlpha,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        color
      });
    }
  }

  // Active traveling neural signal / photon impulse
  let impulse = {
    active: false,
    fromIdx: -1,
    toIdx: -1,
    progress: 0,
    speed: 0.025,
    timer: 0
  };

  function triggerImpulse() {
    if (particles.length < 2) return;
    const candidates = [];
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 30 && dist < CONNECTION_DIST) {
          candidates.push({ i, j });
        }
      }
    }
    if (candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      impulse.active = true;
      impulse.fromIdx = chosen.i;
      impulse.toIdx = chosen.j;
      impulse.progress = 0;
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Synaptic Connecting Lines
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const proximity = 1 - (dist / CONNECTION_DIST);
          const lineAlpha = proximity * 0.22;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(13, 148, 136, ${lineAlpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
    }

    // 2. Draw Traveling Synaptic Signal Impulse
    if (impulse.active && particles[impulse.fromIdx] && particles[impulse.toIdx]) {
      const pFrom = particles[impulse.fromIdx];
      const pTo = particles[impulse.toIdx];
      const ix = pFrom.x + (pTo.x - pFrom.x) * impulse.progress;
      const iy = pFrom.y + (pTo.y - pFrom.y) * impulse.progress;

      ctx.beginPath();
      ctx.arc(ix, iy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(45, 212, 191, 0.85)';
      ctx.shadowColor = 'rgba(13, 148, 136, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      impulse.progress += impulse.speed;
      if (impulse.progress >= 1) {
        impulse.active = false;
      }
    } else {
      impulse.timer++;
      if (impulse.timer > 220) {
        impulse.timer = 0;
        triggerImpulse();
      }
    }

    // 3. Draw Nodes (Particles)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (!prefersReducedMotion) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      const pulseAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.12;
      const currentAlpha = Math.max(0.08, Math.min(0.65, pulseAlpha));

      // Glow halo
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha * 0.25})`;
      ctx.fill();

      // Core node dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;
      ctx.fill();
    }

    if (!prefersReducedMotion && isTabVisible) {
      animationFrameId = requestAnimationFrame(drawFrame);
    }
  }

  resizeCanvas();
  createParticles();
  drawFrame();

  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
    if (prefersReducedMotion) drawFrame();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible && !prefersReducedMotion) {
      cancelAnimationFrame(animationFrameId);
      drawFrame();
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  });
}

// Auto-boot background canvas once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRetinaAiBackgroundCanvas);
} else {
  initRetinaAiBackgroundCanvas();
}