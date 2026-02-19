const state = {
    currentStep: 1,
    formData: {
        firmSize: '',
        sector: '',
        services: [],
        aiType: '',
        autonomy: ''
    }
};

const steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4')
};

const progressSteps = document.querySelectorAll('.progress-step');

function nextStep(currentStepNum) {
    if (!validateStep(currentStepNum)) return;
    
    saveStepData(currentStepNum);
    
    steps[currentStepNum].classList.remove('active');
    steps[currentStepNum].hidden = true;
    
    const nextStepNum = currentStepNum + 1;
    steps[nextStepNum].classList.add('active');
    steps[nextStepNum].hidden = false;
    
    updateProgress(nextStepNum);
    
    if (progressSteps[currentStepNum - 1]) {
        progressSteps[currentStepNum - 1].classList.remove('active');
        progressSteps[currentStepNum - 1].classList.add('completed');
    }
    
    state.currentStep = nextStepNum;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(currentStepNum) {
    const prevStepNum = currentStepNum - 1;
    
    steps[currentStepNum].classList.remove('active');
    steps[currentStepNum].hidden = true;
    
    steps[prevStepNum].classList.add('active');
    steps[prevStepNum].hidden = false;
    
    updateProgress(prevStepNum);
    
    if (progressSteps[currentStepNum - 1]) {
        progressSteps[currentStepNum - 1].classList.remove('completed');
        progressSteps[currentStepNum - 1].classList.remove('active');
    }
    
    if (progressSteps[prevStepNum - 1]) {
        progressSteps[prevStepNum - 1].classList.remove('completed');
        progressSteps[prevStepNum - 1].classList.add('active');
    }
    
    state.currentStep = prevStepNum;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(stepNum) {
    progressSteps.forEach((step, index) => {
        const stepIndex = index + 1;
        step.classList.remove('active');
        
        if (stepIndex === stepNum) {
            step.classList.add('active');
        } else if (stepIndex < stepNum) {
            step.classList.add('completed');
        }
    });
    
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.setAttribute('aria-valuenow', stepNum);
    }
}

function validateStep(stepNum) {
    let isValid = true;
    let errorMessage = '';
    
    switch(stepNum) {
        case 1:
            const firmSize = document.getElementById('firm-size').value;
            const sector = document.querySelector('input[name="sector"]:checked');
            
            if (!firmSize) {
                isValid = false;
                errorMessage = 'Selecteer de grootte van uw organisatie.';
            } else if (!sector) {
                isValid = false;
                errorMessage = 'Selecteer uw sector.';
            }
            break;
            
        case 3:
            const aiType = document.querySelector('input[name="ai-type"]:checked');
            const autonomy = document.querySelector('input[name="autonomy"]:checked');
            
            if (!aiType) {
                isValid = false;
                errorMessage = 'Geef het type AI-systemen aan.';
            } else if (!autonomy) {
                isValid = false;
                errorMessage = 'Geef het autonomieniveau aan.';
            }
            break;
    }
    
    if (!isValid) {
        showValidationError(errorMessage);
    }
    
    return isValid;
}

function showValidationError(message) {
    const existingError = document.querySelector('.validation-error');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.style.cssText = `
        background-color: rgba(220, 38, 38, 0.1);
        color: #dc2626;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border-left: 4px solid #dc2626;
        font-weight: 500;
    `;
    errorDiv.textContent = message;
    
    const currentStepEl = steps[state.currentStep];
    const stepHeader = currentStepEl.querySelector('.step-header');
    stepHeader.insertAdjacentElement('afterend', errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function saveStepData(stepNum) {
    switch(stepNum) {
        case 1:
            state.formData.firmSize = document.getElementById('firm-size').value;
            state.formData.sector = document.querySelector('input[name="sector"]:checked')?.value;
            break;
            
        case 2:
            const services = document.querySelectorAll('input[name="services"]:checked');
            state.formData.services = Array.from(services).map(cb => cb.value);
            break;
            
        case 3:
            state.formData.aiType = document.querySelector('input[name="ai-type"]:checked')?.value;
            state.formData.autonomy = document.querySelector('input[name="autonomy"]:checked')?.value;
            break;
    }
}

function calculateRisk() {
    if (!validateStep(3)) return;
    saveStepData(3);
    
    const { services, aiType, autonomy } = state.formData;
    let riskTier = 'minimal';
    let riskCategory = 'Minimaal risico';
    
    const highRiskServices = ['biometric', 'automated-decision', 'risk-assessment'];
    const hasHighRiskService = services.some(s => highRiskServices.includes(s));
    
    if (aiType === 'prohibited') {
        riskTier = 'high';
        riskCategory = 'Verboden praktijken of hoog risico';
    } else if (hasHighRiskService && autonomy === 'automated') {
        riskTier = 'high';
        riskCategory = 'Hoog-risico systeem';
    } else if (hasHighRiskService || (aiType === 'specialized' && autonomy === 'automated')) {
        riskTier = 'high';
        riskCategory = 'Hoog-risico systeem';
    } else if (services.includes('content-generation') && autonomy === 'automated') {
        riskTier = 'limited';
        riskCategory = 'Beperkt risico (transparantie verplicht)';
    } else if (aiType === 'specialized' || services.length > 2) {
        riskTier = 'limited';
        riskCategory = 'Beperkt risico';
    } else if (aiType === 'general' && autonomy !== 'automated') {
        riskTier = 'minimal';
        riskCategory = 'Minimaal risico';
    } else if (aiType === 'none') {
        riskTier = 'minimal';
        riskCategory = 'Minimaal risico (preventief)';
    } else {
        riskTier = 'limited';
        riskCategory = 'Beperkt risico';
    }
    
    displayResults(riskTier, riskCategory);
    
    steps[3].classList.remove('active');
    steps[3].hidden = true;
    steps[4].classList.add('active');
    steps[4].hidden = false;
    updateProgress(4);
    state.currentStep = 4;
    
    updateCountdown();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function displayResults(tier, category) {
    const badge = document.getElementById('risk-badge');
    const level = document.getElementById('risk-level');
    const cat = document.getElementById('risk-category');
    const legalText = document.getElementById('legal-meaning-text');
    const obligationsList = document.getElementById('obligations-list');
    const governanceText = document.getElementById('governance-text');
    const strategicText = document.getElementById('strategic-text');
    
    badge.className = `risk-badge ${tier}`;
    level.textContent = tier === 'minimal' ? 'Minimaal Risico' : 
                       tier === 'limited' ? 'Beperkt Risico' : 'Hoog Risico';
    cat.textContent = category;
    
    const content = getRiskContent(tier);
    
    legalText.textContent = content.legal;
    governanceText.textContent = content.governance;
    strategicText.textContent = content.strategic;
    
    obligationsList.innerHTML = '';
    content.obligations.forEach(obligation => {
        const li = document.createElement('li');
        li.textContent = obligation;
        obligationsList.appendChild(li);
    });
}

function getRiskContent(tier) {
    const contents = {
        minimal: {
            legal: 'Uw AI-gebruik valt onder de minimaal risico categorie volgens Artikel 6 van de AI Act Verordening. U bent niet onderworpen aan de strikte verplichtingen voor hoog-risico systemen, maar dient wel de basis transparantie-eisen (Artikel 52) te respecteren indien u chatbots of AI-gegenereerde content gebruikt.',
            obligations: [
                'Transparantie naar gebruikers (bij chatbots of deepfakes)',
                'Naleving auteursrecht en trainingsdata',
                'Interne documentatie van AI-gebruik',
                'Regelgevende monitoring voor toekomstige wijzigingen'
            ],
            governance: 'Lage governance impact. Geen conformity assessment verplicht. Management moet wel waarborgen dat het gebruik in deze categorie blijft en niet migreert naar hoog-risico toepassingen zonder board goedkeuring.',
            strategic: 'Aanbevolen: gebruik deze periode voor vrijwillige ethische governance. Anticipeer op regelgevingsontwikkeling door processen te documenteren. Dit is het ideale moment om een AI-beleid te structureren voordat verplichtingen verscherpen.'
        },
        limited: {
            legal: 'Uw blootstelling is geclassificeerd als beperkt risico (Artikel 52). U gebruikt waarschijnlijk general purpose AI (GPAI) of gespecialiseerde tools met menselijk toezicht. Transparantieverplichtingen gelden, met name het informeren van gebruikers en documenteren van systeemcapaciteiten en -beperkingen.',
            obligations: [
                'Duidelijke informatie aan gebruikers over AI-interactie',
                'Technische documentatie van geïmplementeerde systemen',
                'Labeling van AI-gegenereerde content (deepfakes, tekst)',
                'Effectieve menselijke supervisie implementeren',
                'Impactbeoordeling op grondrechten'
            ],
            governance: 'Matige board-level blootstelling. Management moet use cases valideren en traceerbaarheid waarborgen. Een compliance officer moet worden aangewezen, zelfs formeel. AI-tool aankopen vereisen systematische juridische review.',
            strategic: 'Structureringskans. U bevindt zich in een zone waar proactieve governance-investering een concurrentievoordeel wordt. Klanten vragen steeds vaker compliance-bewijs. Structureer nu om later hoge nood-conformiteitskosten te vermijden.'
        },
        high: {
            legal: 'REGELGEVINGSALERT: U bent waarschijnlijk onderworpen aan hoog-risico AI-systemen (Artikel 6 en Annex III). Dit omvat biometrische systemen, risicobeoordelingen voor toegang tot essentiële diensten, of geautomatiseerde besluitvorming met significante juridische impact. Strikte pre-markt verplichtingen gelden.',
            obligations: [
                'Conformity assessment verplicht voor deployment',
                'Kwaliteitsmanagement en documentatiesysteem',
                'Significante menselijke supervisie (human-in-the-loop)',
                'Transparantie en informatieverstrekking aan gebruikers',
                'Registratie in EU AI database',
                'Incident management en non-conformiteit correctie',
                'Logboekbewaring minimum 6 maanden'
            ],
            governance: 'KRITIEKE BOARD-LEVEL BLOOTSTELLING. Bestuurders lopen persoonlijke sancties bij non-conformiteit. Verplicht robuust governance systeem met compliance officer, regelmatige interne audits, en verplicht kwartaal board review. Civiele aansprakelijkheid is risico.',
            strategic: 'ONMIDDELLIJKE ACTIE VEREIST. U moet significante resources vrijmaken voor conformiteit vóór augustus 2026. Non-naleving leidt tot sancties tot 7% wereldwijde omzet. Echter, aangetoonde conformiteit wordt majeur concurrentievoordeel tegenover onvoorbereide concurrenten.'
        }
    };
    
    return contents[tier] || contents.minimal;
}

function updateCountdown() {
    const targetDate = new Date('2026-08-02T00:00:00');
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) {
            countdownEl.textContent = `${months} maanden en ${remainingDays} dagen resterend`;
        }
    }
}

function resetAssessment() {
    state.currentStep = 1;
    state.formData = {
        firmSize: '',
        sector: '',
        services: [],
        aiType: '',
        autonomy: ''
    };
    
    document.getElementById('firm-size').value = '';
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    
    progressSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });
    
    Object.values(steps).forEach((step, index) => {
        step.classList.remove('active');
        step.hidden = index !== 0;
        if (index === 0) step.classList.add('active');
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function() {
    updateProgress(1);
    
    document.querySelectorAll('.assessment-step').forEach(step => {
        step.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                const currentStepNum = parseInt(step.id.split('-')[1]);
                if (currentStepNum < 4) {
                    nextStep(currentStepNum);
                }
            }
        });
    });
});
