/* Dovela native i18n: curated copy, no external translation or location service. */
(function () {
  'use strict';

  const STORAGE_KEY = 'dovela.language.preference';
  const SUPPORTED = Object.freeze(['es', 'en', 'fr', 'pt']);
  const LOCALES = Object.freeze({
    es: { label: 'Español', tag: 'es-PA' },
    en: { label: 'English', tag: 'en-US' },
    fr: { label: 'Français', tag: 'fr-FR' },
    pt: { label: 'Português', tag: 'pt-BR' }
  });

  const rows = [
    ['Portal de Autogestión · Dovela Seguros', 'Dovela Insurance · Self-service portal', 'Dovela Assurances · Espace en libre-service', 'Dovela Seguros · Portal de autoatendimento'],
    ['Portal de autogestión de Dovela Seguros: presente reclamos, consulte su estado y encuentre prestadores. Entidad ficticia con fines demostrativos.', 'Dovela Insurance self-service portal: submit claims, follow their progress and find care providers. Fictional company for demonstration purposes.', 'Espace en libre-service Dovela Assurances : déposez une demande, suivez son avancement et trouvez un prestataire de soins. Société fictive à des fins de démonstration.', 'Portal de autoatendimento da Dovela Seguros: envie sinistros, acompanhe o andamento e encontre prestadores. Empresa fictícia para fins de demonstração.'],
    ['Reclamos, seguimiento y red de prestadores en un solo lugar. Entidad ficticia con fines demostrativos.', 'Claims, updates and the provider network—all in one place. Fictional company for demonstration purposes.', 'Demandes, suivi et réseau de soins, réunis au même endroit. Société fictive à des fins de démonstration.', 'Sinistros, acompanhamento e rede credenciada em um só lugar. Empresa fictícia para fins de demonstração.'],
    ['Cargando Dovela…', 'Preparing Dovela…', 'Préparation de Dovela…', 'Preparando a Dovela…'],
    ['Navegación principal', 'Main navigation', 'Navigation principale', 'Navegação principal'],
    ['Más', 'More', 'Plus', 'Mais'],
    ['Abrir más opciones', 'Open more options', 'Ouvrir plus d’options', 'Abrir mais opções'],
    ['Cerrar más opciones', 'Close more options', 'Fermer les options', 'Fechar mais opções'],
    ['Apariencia', 'Appearance', 'Apparence', 'Aparência'],
    ['Acceso interno', 'Staff access', 'Accès équipe', 'Acesso da equipe'],
    ['Lo que más importa,', 'What matters most,', 'L’essentiel,', 'O que mais importa,'],
    ['bien sostenido.', 'carefully protected.', 'bien protégé.', 'sempre bem cuidado.'],
    ['Presente reclamos, siga su estado y encuentre prestadores con la claridad y el acompañamiento que usted merece.', 'Submit a claim, follow its progress and find a provider—with clear guidance at every step.', 'Déposez une demande, suivez son avancement et trouvez un prestataire, avec des explications claires à chaque étape.', 'Envie um sinistro, acompanhe o andamento e encontre prestadores, com orientação clara em cada etapa.'],
    ['Explore nuestros servicios', 'Explore our services', 'Découvrir nos services', 'Conheça nossos serviços'],
    ['Novedades de Dovela', 'Dovela highlights', 'Actualités Dovela', 'Novidades Dovela'],
    ['Seleccione una novedad', 'Choose a highlight', 'Choisir une actualité', 'Escolha uma novidade'],
    ['Pausar novedades', 'Pause highlights', 'Mettre les actualités en pause', 'Pausar novidades'],
    ['Reanudar novedades', 'Resume highlights', 'Relancer les actualités', 'Retomar novidades'],
    ['Pausar', 'Pause', 'Pause', 'Pausar'],
    ['Reanudar', 'Resume', 'Reprendre', 'Retomar'],
    ['SERVICIOS EN LÍNEA', 'ONLINE SERVICES', 'SERVICES EN LIGNE', 'SERVIÇOS ONLINE'],
    ['Estamos aquí para ayudarle', 'Everything you need, close at hand', 'Tout ce dont vous avez besoin, à portée de main', 'Tudo o que você precisa, sempre à mão'],
    ['Acceda directamente a las gestiones y recursos que necesita.', 'Go straight to the service or resource you need.', 'Accédez directement à la démarche ou à la ressource recherchée.', 'Acesse diretamente o serviço ou recurso de que precisa.'],
    ['GESTIÓN DE RECLAMOS', 'CLAIMS', 'DEMANDES DE REMBOURSEMENT', 'SINISTROS'],
    ['Presentar un reclamo', 'Submit a claim', 'Déposer une demande', 'Enviar um sinistro'],
    ['Salud individual, colectivo salud, vida y accidentes personales. Formulario guiado según quién presenta.', 'For individual and group health, life and personal accident coverage. The form adapts to the person submitting it.', 'Pour la santé individuelle ou collective, la vie et les accidents personnels. Le formulaire s’adapte au profil du demandeur.', 'Para saúde individual e empresarial, vida e acidentes pessoais. O formulário se adapta a quem está enviando.'],
    ['Iniciar solicitud', 'Start a claim', 'Commencer', 'Iniciar solicitação'],
    ['ATENCIÓN MÉDICA', 'FIND CARE', 'TROUVER DES SOINS', 'ATENDIMENTO MÉDICO'],
    ['Red Médica Dovela', 'Dovela provider network', 'Réseau de soins Dovela', 'Rede credenciada Dovela'],
    ['Consulte hospitales, clínicas y médicos del directorio de prestadores. Filtre por especialidad, provincia o nombre.', 'Find hospitals, clinics and physicians in the provider directory. Search by specialty, province or name.', 'Trouvez un hôpital, une clinique ou un médecin dans l’annuaire. Recherchez par spécialité, province ou nom.', 'Encontre hospitais, clínicas e médicos na rede credenciada. Pesquise por especialidade, província ou nome.'],
    ['Explorar red', 'Browse the network', 'Parcourir le réseau', 'Consultar a rede'],
    ['SEGUIMIENTO DE RECLAMOS', 'CLAIM UPDATES', 'SUIVI DES DEMANDES', 'ACOMPANHAMENTO DE SINISTROS'],
    ['Consultar estado de reclamo', 'Check a claim', 'Suivre une demande', 'Consultar um sinistro'],
    ['Consulte el progreso de su solicitud con el código de seguimiento recibido al presentar el reclamo.', 'Use the tracking code from your receipt to see where your claim stands.', 'Utilisez le code figurant sur votre reçu pour connaître l’avancement de votre demande.', 'Use o código informado no comprovante para acompanhar o andamento do sinistro.'],
    ['Consultar estado', 'Check status', 'Consulter le statut', 'Consultar andamento'],
    ['GUÍA RÁPIDA · CÓDIGO QR', 'QUICK GUIDE · QR CODE', 'GUIDE RAPIDE · CODE QR', 'GUIA RÁPIDO · QR CODE'],
    ['Siga su reclamo desde el celular', 'Track your claim from your phone', 'Suivez votre demande depuis votre téléphone', 'Acompanhe seu sinistro pelo celular'],
    ['Su comprobante de reclamo en PDF incluye un código QR que abre directamente la consulta de estado.', 'Your PDF claim receipt includes a QR code that opens the status check directly.', 'Votre reçu de demande au format PDF comporte un code QR qui ouvre directement le suivi.', 'O comprovante do sinistro em PDF traz um QR code que abre diretamente a consulta de andamento.'],
    ['Abra la cámara', 'Open your camera', 'Ouvrez l’appareil photo', 'Abra a câmera'],
    ['Use la cámara de su celular o una aplicación lectora de códigos QR.', 'Use your phone’s camera or a QR code reader app.', 'Utilisez l’appareil photo de votre téléphone ou une application de lecture de codes QR.', 'Use a câmera do celular ou um aplicativo leitor de QR code.'],
    ['Apunte al código QR', 'Point at the QR code', 'Visez le code QR', 'Aponte para o QR code'],
    ['Lo encontrará junto a los datos de su comprobante, impreso o en pantalla.', 'You’ll find it next to the details on your receipt, printed or on screen.', 'Il figure à côté des informations de votre reçu, imprimé ou à l’écran.', 'Ele fica ao lado dos dados do comprovante, impresso ou na tela.'],
    ['Toque el enlace', 'Tap the link', 'Touchez le lien', 'Toque no link'],
    ['Su código de reclamo se carga solo; confirme con la cédula o pasaporte del asegurado.', 'Your claim code fills in automatically; confirm with the member’s ID or passport number.', 'Le code de votre demande s’affiche automatiquement ; confirmez avec la pièce d’identité ou le passeport de l’assuré.', 'O código do sinistro é preenchido automaticamente; confirme com o documento de identidade ou passaporte do segurado.'],
    ['Pausar animación de la guía', 'Pause guide animation', 'Mettre l’animation du guide en pause', 'Pausar animação do guia'],
    ['Reanudar animación de la guía', 'Resume guide animation', 'Relancer l’animation du guide', 'Retomar animação do guia'],
    ['Escanee con su celular', 'Scan with your phone', 'Scannez avec votre téléphone', 'Escaneie com o celular'],
    ['para seguir su reclamo', 'to track your claim', 'pour suivre votre demande', 'para acompanhar o sinistro'],
    ['Consulte el estado', 'Check the status', 'Consultez le suivi', 'Consulte o andamento'],
    ['en el portal de Dovela', 'on the Dovela portal', 'sur l’espace Dovela', 'no portal da Dovela'],
    ['Cargamos el código de su comprobante. Introduzca la cédula o pasaporte del asegurado para continuar.', 'We filled in the code from your receipt. Enter the member’s ID or passport number to continue.', 'Nous avons repris le code de votre reçu. Saisissez la pièce d’identité ou le passeport de l’assuré pour continuer.', 'Preenchemos o código do seu comprovante. Informe o documento de identidade ou passaporte do segurado para continuar.'],
    ['ASISTENCIA INMEDIATA', 'IMMEDIATE SUPPORT', 'ASSISTANCE IMMÉDIATE', 'ASSISTÊNCIA IMEDIATA'],
    ['Coordinación y emergencias médicas', 'Medical coordination and emergencies', 'Coordination médicale et urgences', 'Coordenação médica e emergências'],
    ['Si necesita atención médica inmediata, acuda al servicio de urgencias más cercano y comuníquese con la', 'If you need immediate medical attention, go to the nearest emergency department and contact the', 'Si vous avez besoin de soins immédiats, rendez-vous au service d’urgence le plus proche et contactez la', 'Se precisar de atendimento imediato, procure o pronto-socorro mais próximo e entre em contato com a'],
    ['Línea de Asistencia Dovela', 'Dovela Assistance Line', 'Ligne d’assistance Dovela', 'Central de Assistência Dovela'],
    ['indicada en su carné de asegurado. Le orientaremos sobre los siguientes pasos.', 'shown on your member card. We will guide you through what comes next.', 'indiquée sur votre carte d’assuré. Nous vous guiderons pour la suite.', 'indicada na sua carteirinha. Nossa equipe orientará você sobre os próximos passos.'],
    ['RECURSOS ÚTILES', 'HELPFUL RESOURCES', 'RESSOURCES UTILES', 'RECURSOS ÚTEIS'],
    ['Formularios', 'Forms', 'Formulaires', 'Formulários'],
    ['Descargue, complete y firme el formulario que necesite; luego cárguelo junto con sus documentos en el paso correspondiente.', 'Download, complete and sign the form you need, then upload it with your documents at the relevant step.', 'Téléchargez, remplissez et signez le formulaire adapté, puis joignez-le à vos documents à l’étape prévue.', 'Baixe, preencha e assine o formulário adequado; depois, anexe-o com os demais documentos na etapa indicada.'],
    ['Formulario de Reclamos de Gastos Médicos', 'Medical expense claim form', 'Formulaire de remboursement de frais médicaux', 'Formulário de reembolso de despesas médicas'],
    ['Requerido para reclamos de salud y accidentes personales. Incluye las secciones del asegurado y del médico proveedor, y la guía de presentación.', 'Required for health and personal accident claims. Includes sections for the member and treating provider, plus submission guidance.', 'Requis pour les demandes liées à la santé et aux accidents personnels. Il comprend les volets assuré et professionnel de santé, ainsi que les consignes d’envoi.', 'Necessário para sinistros de saúde e acidentes pessoais. Inclui as seções do segurado e do profissional de saúde, além das orientações de envio.'],
    ['Formulario de Pre-Autorización de Beneficios', 'Benefits pre-authorization form', 'Formulaire de demande d’autorisation préalable', 'Formulário de autorização prévia'],
    ['Para hospitalización, cirugías electivas, procedimientos y estudios especializados. Debe someterse al menos 3 días antes de la fecha sugerida para cirugías electivas.', 'For hospital stays, elective surgery, procedures and specialist tests. For elective surgery, submit it at least three days before the proposed date.', 'Pour une hospitalisation, une intervention programmée, un acte ou un examen spécialisé. En cas d’intervention programmée, envoyez-le au moins trois jours avant la date prévue.', 'Para internações, cirurgias eletivas, procedimentos e exames especializados. Em cirurgias eletivas, envie com pelo menos três dias de antecedência.'],
    ['Descargar', 'Download', 'Télécharger', 'Baixar'],
    ['Ver en línea', 'View online', 'Voir en ligne', 'Ver online'],
    ['UN PROCESO CLARO', 'A CLEAR PROCESS', 'UN PARCOURS CLAIR', 'UM PROCESSO CLARO'],
    ['Cómo funciona', 'How it works', 'Comment ça marche', 'Como funciona'],
    ['Tres pasos, un solo canal, trazabilidad completa.', 'Three simple steps, one place to follow everything.', 'Trois étapes simples, un seul espace pour tout suivre.', 'Três etapas simples, um único canal para acompanhar tudo.'],
    ['PASO 01', 'STEP 01', 'ÉTAPE 01', 'ETAPA 01'],
    ['PASO 02', 'STEP 02', 'ÉTAPE 02', 'ETAPA 02'],
    ['PASO 03', 'STEP 03', 'ÉTAPE 03', 'ETAPA 03'],
    ['Complete el formulario', 'Tell us about the claim', 'Présentez votre demande', 'Conte sobre o sinistro'],
    ['Indique quién presenta y el producto. El sistema le muestra exactamente los requisitos que le aplican.', 'Choose who is submitting and the relevant product. We will show only the requirements that apply.', 'Indiquez qui dépose la demande et le produit concerné. Seules les pièces utiles à votre situation seront affichées.', 'Informe quem está enviando e o produto relacionado. Mostraremos apenas os requisitos aplicáveis ao seu caso.'],
    ['Cargue sus documentos', 'Add your documents', 'Ajoutez vos justificatifs', 'Anexe seus documentos'],
    ['Suba archivos o tome fotos desde su celular siguiendo la guía. Validamos formato y tamaño antes del envío.', 'Upload files or take photos on your phone using the guide. We check file type and size before submission.', 'Importez vos fichiers ou photographiez-les depuis votre téléphone en suivant nos conseils. Le format et la taille sont vérifiés avant l’envoi.', 'Envie arquivos ou tire fotos pelo celular seguindo as orientações. Verificamos formato e tamanho antes do envio.'],
    ['Reciba su radicado', 'Get your tracking number', 'Recevez votre numéro de suivi', 'Receba seu protocolo'],
    ['Obtenga al instante un número único que lo acompaña durante todo el proceso.', 'Receive a unique number right away and use it to follow every stage.', 'Recevez immédiatement un numéro unique pour suivre chaque étape.', 'Receba na hora um número único para acompanhar todas as etapas.'],
    ['Protección que se construye pieza a pieza: acompañamos a cada persona con procesos claros, trato cercano y decisiones explicadas.', 'Protection built one thoughtful step at a time, with clear processes, personal support and decisions you can understand.', 'Une protection qui se construit pas à pas, grâce à des démarches claires, un accompagnement humain et des décisions expliquées.', 'Proteção construída passo a passo, com processos claros, atendimento próximo e decisões bem explicadas.'],
    ['Misión', 'Our purpose', 'Notre mission', 'Nossa missão'],
    ['Visión', 'Our vision', 'Notre ambition', 'Nossa visão'],
    ['Sostener la tranquilidad de las personas con un servicio de seguros claro, oportuno y humano en cada momento que importa.', 'Give people peace of mind through insurance service that is clear, timely and human when it matters most.', 'Préserver la sérénité de chacun grâce à un service d’assurance clair, réactif et humain dans les moments importants.', 'Cuidar da tranquilidade das pessoas com um serviço de seguros claro, ágil e humano nos momentos que importam.'],
    ['Ser la aseguradora de referencia por la confianza que genera, la transparencia de sus procesos y la calidez de su servicio.', 'Set the standard for trustworthy insurance through transparent processes and genuinely caring service.', 'Devenir une référence de confiance grâce à la transparence de nos démarches et à la qualité humaine de notre service.', 'Ser referência em confiança, com processos transparentes e um atendimento verdadeiramente acolhedor.'],
    ['Dovela Seguros · Operaciones y Reclamos.', 'Dovela Insurance · Operations and Claims.', 'Dovela Assurances · Opérations et demandes.', 'Dovela Seguros · Operações e Sinistros.'],
    ['Entidad ficticia con fines demostrativos: no es una aseguradora autorizada, no emite pólizas ni ofrece coberturas reales.', 'Fictional company for demonstration purposes: it is not a licensed insurer and does not issue policies or provide real coverage.', 'Société fictive à des fins de démonstration : ce n’est pas un assureur agréé, elle n’émet aucun contrat et ne fournit aucune couverture réelle.', 'Empresa fictícia para fins de demonstração: não é uma seguradora autorizada, não emite apólices nem oferece coberturas reais.'],
    ['← Volver al inicio', '← Back to home', '← Retour à l’accueil', '← Voltar ao início'],
    ['Tiempo estimado: 3–5 minutos.', 'Estimated time: 3–5 minutes.', 'Temps estimé : 3 à 5 minutes.', 'Tempo estimado: 3 a 5 minutos.'],
    ['Perfil', 'Profile', 'Profil', 'Perfil'],
    ['Producto', 'Coverage', 'Contrat', 'Produto'],
    ['Asegurado', 'Member', 'Assuré', 'Segurado'],
    ['Evento', 'Incident', 'Événement', 'Evento'],
    ['Documentos', 'Documents', 'Documents', 'Documentos'],
    ['Confirmar', 'Review', 'Vérification', 'Revisar'],
    ['¿Quién presenta el reclamo?', 'Who is submitting this claim?', 'Qui dépose cette demande ?', 'Quem está enviando o sinistro?'],
    ['Seleccione quién presenta el reclamo para continuar.', 'Choose who is submitting before continuing.', 'Choisissez le profil du demandeur pour continuer.', 'Escolha quem está enviando para continuar.'],
    ['Seleccione la línea del reclamo', 'Choose the type of coverage', 'Choisissez le type de contrat', 'Escolha a categoria do sinistro'],
    ['Seleccione la línea del reclamo.', 'Choose the type of coverage.', 'Choisissez le type de contrat.', 'Escolha a categoria do sinistro.'],
    ['Producto de la póliza', 'Policy product', 'Produit du contrat', 'Produto da apólice'],
    ['Seleccione la línea primero…', 'Choose a coverage type first…', 'Choisissez d’abord un type de contrat…', 'Escolha primeiro a categoria…'],
    ['Seleccione…', 'Choose…', 'Sélectionnez…', 'Selecione…'],
    ['No estoy seguro', 'I’m not sure', 'Je ne sais pas', 'Não tenho certeza'],
    ['Seleccione el producto.', 'Choose the policy product.', 'Choisissez le produit du contrat.', 'Escolha o produto da apólice.'],
    ['Tipo de servicio', 'Type of care', 'Type de soins', 'Tipo de atendimento'],
    ['Seleccione el servicio relacionado con su reclamo.', 'Choose the type of care related to this claim.', 'Choisissez le type de soins concerné.', 'Escolha o tipo de atendimento relacionado ao sinistro.'],
    ['Servicio Médico', 'Medical care', 'Soins médicaux', 'Atendimento médico'],
    ['Servicio Dental', 'Dental care', 'Soins dentaires', 'Atendimento odontológico'],
    ['Servicio Óptico', 'Vision care', 'Soins optiques', 'Atendimento oftalmológico'],
    ['Seleccione el tipo de servicio.', 'Choose a type of care.', 'Choisissez un type de soins.', 'Escolha o tipo de atendimento.'],
    ['Nombre completo del asegurado', 'Member’s full name', 'Nom complet de l’assuré', 'Nome completo do segurado'],
    ['Cédula o pasaporte del asegurado', 'Member ID or passport', 'Pièce d’identité ou passeport de l’assuré', 'Documento de identidade ou passaporte do segurado'],
    ['Número de póliza / certificado', 'Policy or certificate number', 'Numéro de contrat ou de certificat', 'Número da apólice ou certificado'],
    ['Si lo conoce', 'If available', 'Si vous le connaissez', 'Se souber'],
    ['Teléfono de contacto', 'Contact phone', 'Téléphone', 'Telefone de contato'],
    ['Correo electrónico', 'Email address', 'Adresse e-mail', 'E-mail'],
    ['Nombre de la corredora', 'Broker name', 'Nom du courtier', 'Nome da corretora'],
    ['Fecha de atención (primera fecha, incluye facturas)', 'First date of care shown on the invoices', 'Première date de soins indiquée sur les factures', 'Primeira data de atendimento informada nas notas'],
    ['Monto facturado (USD)', 'Amount billed (USD)', 'Montant facturé (USD)', 'Valor faturado (USD)'],
    ['No conozco el monto exacto', 'I don’t know the exact amount', 'Je ne connais pas le montant exact', 'Não sei o valor exato'],
    ['Descripción del evento', 'What happened?', 'Que s’est-il passé ?', 'O que aconteceu?'],
    ['Revise antes de enviar', 'Review before submitting', 'Vérifiez avant l’envoi', 'Revise antes de enviar'],
    ['¡Reclamo recibido!', 'Your claim is in!', 'Votre demande a bien été reçue !', 'Sinistro recebido!'],
    ['Comprobante de Recepción', 'Claim receipt', 'Accusé de réception', 'Comprovante de recebimento'],
    ['Código', 'Code', 'Code', 'Código'],
    ['Presentado por', 'Submitted by', 'Déposé par', 'Enviado por'],
    ['Línea', 'Coverage type', 'Type de contrat', 'Categoria'],
    ['Servicio', 'Care type', 'Type de soins', 'Atendimento'],
    ['Fecha del evento', 'Date of care', 'Date des soins', 'Data do atendimento'],
    ['Recibido', 'Received', 'Reçue', 'Recebido'],
    ['Volver al inicio', 'Back to home', 'Retour à l’accueil', 'Voltar ao início'],
    ['Volver arriba', 'Back to top', 'Retour en haut', 'Voltar ao topo'],
    ['Descargar comprobante PDF', 'Download PDF receipt', 'Télécharger le reçu PDF', 'Baixar comprovante em PDF'],
    ['Preparando el comprobante PDF…', 'Preparing your PDF receipt…', 'Préparation de votre reçu PDF…', 'Preparando o comprovante em PDF…'],
    ['La descarga del comprobante comenzó.', 'Your receipt download has started.', 'Le téléchargement de votre reçu a commencé.', 'O download do comprovante foi iniciado.'],
    ['No pudimos generar el comprobante PDF. Inténtelo nuevamente.', 'We could not generate the PDF receipt. Please try again.', 'Nous n’avons pas pu générer le reçu PDF. Veuillez réessayer.', 'Não foi possível gerar o comprovante em PDF. Tente novamente.'],
    ['← Atrás', '← Back', '← Précédent', '← Voltar'],
    ['Continuar →', 'Continue →', 'Continuer →', 'Continuar →'],
    ['Enviar reclamo', 'Submit claim', 'Envoyer la demande', 'Enviar sinistro'],
    ['CONSULTA DE SU SOLICITUD', 'YOUR CLAIM DETAILS', 'DÉTAIL DE VOTRE DEMANDE', 'DETALHES DO SINISTRO'],
    ['Estado de su reclamo', 'Your claim status', 'Statut de votre demande', 'Andamento do sinistro'],
    ['Código de reclamo', 'Claim code', 'Code de la demande', 'Código do sinistro'],
    ['Encuéntrelo en su comprobante de recepcion de reclamo', 'You’ll find it on your claim receipt.', 'Il figure sur votre accusé de réception.', 'Você encontra o código no comprovante do sinistro.'],
    ['Correo registrado en el reclamo', 'Email used for the claim', 'Adresse e-mail associée à la demande', 'E-mail informado no sinistro'],
    ['Es una comprobación adicional para proteger su consulta.', 'We use this extra check to protect your information.', 'Cette vérification supplémentaire protège vos informations.', 'Essa verificação adicional ajuda a proteger seus dados.'],
    ['Consultar nuevamente', 'Check another claim', 'Consulter une autre demande', 'Consultar outro sinistro'],
    ['Volver', 'Back', 'Retour', 'Voltar'],
    ['Estamos consultando el estado de su reclamo.', 'We’re looking up your claim.', 'Nous recherchons votre demande.', 'Estamos consultando seu sinistro.'],
    ['No encontramos un reclamo con esos datos.', 'We couldn’t find a claim matching those details.', 'Aucune demande ne correspond à ces informations.', 'Não encontramos um sinistro com esses dados.'],
    ['No fue posible consultar el reclamo en este momento.', 'We can’t retrieve your claim right now. Please try again.', 'La consultation est momentanément indisponible. Réessayez dans quelques instants.', 'Não foi possível consultar o sinistro agora. Tente novamente.'],
    ['Enviando su reclamo', 'Submitting your claim', 'Envoi de votre demande', 'Enviando seu sinistro'],
    ['Preparando la solicitud...', 'Preparing your submission…', 'Préparation de votre dossier…', 'Preparando sua solicitação…'],
    ['No cierre esta ventana mientras procesamos su solicitud.', 'Keep this window open while we process your submission.', 'Gardez cette fenêtre ouverte pendant le traitement de votre dossier.', 'Mantenha esta janela aberta enquanto processamos sua solicitação.'],
    ['Especialidad', 'Specialty', 'Spécialité', 'Especialidade'],
    ['Provincia', 'Province', 'Province', 'Província'],
    ['Todas las especialidades', 'All specialties', 'Toutes les spécialités', 'Todas as especialidades'],
    ['Todas las provincias', 'All provinces', 'Toutes les provinces', 'Todas as províncias'],
    ['Buscar por nombre, hospital o ciudad', 'Search by name, hospital or city', 'Rechercher par nom, établissement ou ville', 'Buscar por nome, hospital ou cidade'],
    ['Nombre / Proveedor', 'Name / Provider', 'Nom / Prestataire', 'Nome / Prestador'],
    ['Dirección', 'Address', 'Adresse', 'Endereço'],
    ['Teléfono', 'Phone', 'Téléphone', 'Telefone'],
    ['Asegurado / Titular', 'Member / Policyholder', 'Assuré / Souscripteur', 'Segurado / Titular'],
    ['El titular de la póliza, un familiar o beneficiario. Tenga a mano su cédula y los documentos del evento.', 'The policyholder, a family member or a beneficiary. Have the member ID and supporting documents ready.', 'Le souscripteur, un proche ou un bénéficiaire. Préparez la pièce d’identité et les justificatifs.', 'O titular, um familiar ou beneficiário. Tenha em mãos o documento de identidade e os comprovantes.'],
    ['Corredor de seguros', 'Insurance broker', 'Courtier en assurance', 'Corretor de seguros'],
    ['Presenta en nombre del asegurado. Tenga a mano los datos del asegurado y los documentos del evento.', 'Submitting on behalf of the member. Have their details and supporting documents ready.', 'Vous déposez la demande pour l’assuré. Préparez ses coordonnées et les justificatifs.', 'Envio em nome do segurado. Tenha em mãos os dados dele e os comprovantes.'],
    ['Hospital / Clínica', 'Hospital / Clinic', 'Hôpital / Clinique', 'Hospital / Clínica'],
    ['Facturación directa del proveedor. Tenga a mano la documentación clínica y de facturación del paciente.', 'For direct provider billing. Have the patient’s clinical and billing documents ready.', 'Pour une facturation directe par le prestataire. Préparez les documents médicaux et de facturation du patient.', 'Para faturamento direto do prestador. Tenha em mãos os documentos clínicos e de cobrança do paciente.'],
    ['Salud Individual', 'Individual health', 'Santé individuelle', 'Saúde individual'],
    ['Reclamos de gastos médicos de pólizas individuales.', 'Medical expense claims under an individual policy.', 'Remboursement de frais médicaux au titre d’un contrat individuel.', 'Reembolso de despesas médicas de apólices individuais.'],
    ['Colectivo Salud', 'Group health', 'Santé collective', 'Saúde empresarial'],
    ['Reclamos de gastos médicos de pólizas colectivas de empresas.', 'Medical expense claims under an employer group plan.', 'Remboursement de frais médicaux au titre d’un contrat collectif d’entreprise.', 'Reembolso de despesas médicas de planos empresariais.'],
    ['Accidentes Personales', 'Personal accident', 'Accidents personnels', 'Acidentes pessoais'],
    ['Reclamos por lesiones a causa de accidente (AP Regular y AP Escolar). Para asistencia inmediata, use la Línea de Asistencia Dovela indicada en su carné.', 'Claims for injuries caused by an accident, including regular and school coverage. For urgent help, call the Dovela Assistance Line on your member card.', 'Demandes liées à une blessure accidentelle, y compris les formules standard et scolaire. En cas d’urgence, appelez la ligne Dovela indiquée sur votre carte.', 'Sinistros por lesões causadas por acidente, incluindo coberturas regular e escolar. Para ajuda imediata, ligue para a Central Dovela indicada na carteirinha.'],
    ['Obligatorio', 'Required', 'Obligatoire', 'Obrigatório'],
    ['Opcional', 'Optional', 'Facultatif', 'Opcional'],
    ['varios archivos', 'multiple files', 'plusieurs fichiers', 'vários arquivos'],
    ['Reemplazar', 'Replace', 'Remplacer', 'Substituir'],
    ['Cargar', 'Upload', 'Importer', 'Anexar'],
    ['Tomar foto', 'Take a photo', 'Prendre une photo', 'Tirar foto'],
    ['Formato no permitido.', 'This file type is not supported.', 'Ce format de fichier n’est pas accepté.', 'Esse tipo de arquivo não é aceito.'],
    ['Formulario descargado', 'Form downloaded', 'Formulaire téléchargé', 'Formulário baixado'],
    ['En Proceso', 'Under review', 'En cours d’étude', 'Em análise'],
    ['Pendiente de Información', 'More information needed', 'Informations complémentaires requises', 'Aguardando informações'],
    ['Pagado', 'Paid', 'Payée', 'Pago'],
    ['Rechazado', 'Closed without payment', 'Clôturée sans règlement', 'Encerrado sem pagamento'],
    ['Hemos recibido su reclamo y comenzaremos su revisión.', 'We have received your claim and will begin reviewing it.', 'Votre demande est bien arrivée et sera prochainement examinée.', 'Recebemos seu sinistro e iniciaremos a análise.'],
    ['Nuestro equipo está revisando su reclamo.', 'Our team is reviewing your claim.', 'Notre équipe examine votre demande.', 'Nossa equipe está analisando seu sinistro.'],
    ['Necesitamos información adicional. Revise el correo registrado en su solicitud.', 'We need a little more information. Check the email linked to your claim.', 'Des informations complémentaires sont nécessaires. Consultez l’adresse e-mail associée à votre demande.', 'Precisamos de mais informações. Consulte o e-mail informado no sinistro.'],
    ['El pago de su reclamo ha sido procesado. Consulte el detalle en la comunicación enviada a su correo.', 'Your claim payment has been processed. See the message sent to your email for details.', 'Le règlement a été effectué. Consultez le message envoyé par e-mail pour le détail.', 'O pagamento do sinistro foi processado. Consulte os detalhes enviados por e-mail.'],
    ['La evaluación ha concluido. Consulte la comunicación enviada a su correo para conocer los detalles.', 'The review is complete. See the message sent to your email for details and next steps.', 'L’étude est terminée. Consultez le message envoyé par e-mail pour connaître le détail et la suite.', 'A análise foi concluída. Consulte o e-mail enviado para ver os detalhes e próximos passos.'],
    ['Gestiones con la tranquilidad de estar respaldado', 'Move forward knowing you’re supported', 'Avancez en toute sérénité', 'Siga em frente com todo o apoio'],
    ['Presente sus reclamos en línea con un proceso claro, desde el primer paso hasta su radicado.', 'Submit a claim online through a clear process, from the first question to your tracking number.', 'Déposez votre demande en ligne grâce à un parcours clair, jusqu’à l’obtention de votre numéro de suivi.', 'Envie seu sinistro online em um processo claro, do primeiro passo até o número de protocolo.'],
    ['Conocer el proceso', 'See how it works', 'Voir les étapes', 'Conhecer o processo'],
    ['Encuentre atención cuando la necesite', 'Find care when you need it', 'Trouvez des soins au bon moment', 'Encontre atendimento quando precisar'],
    ['Consulte la Red Médica Dovela por especialidad, provincia o nombre del prestador.', 'Search the Dovela network by specialty, province or provider name.', 'Recherchez dans le réseau Dovela par spécialité, province ou nom du prestataire.', 'Consulte a rede Dovela por especialidade, província ou nome do prestador.'],
    ['Consultar red médica', 'Search the network', 'Consulter le réseau', 'Consultar a rede'],
    ['Sus formularios, siempre a mano', 'The right forms, ready when you are', 'Vos formulaires, toujours à portée de main', 'Seus formulários, sempre à mão'],
    ['Revise los formularios disponibles y prepare los documentos antes de iniciar su solicitud.', 'Review the available forms and gather your documents before you begin.', 'Consultez les formulaires disponibles et préparez vos justificatifs avant de commencer.', 'Consulte os formulários disponíveis e prepare os documentos antes de começar.'],
    ['Ver formularios', 'View forms', 'Voir les formulaires', 'Ver formulários'],
    ['NOVEDADES DOVELA', 'DOVELA HIGHLIGHTS', 'ACTUALITÉS DOVELA', 'NOVIDADES DOVELA'],
    ['Sin resultados con esos filtros.', 'No providers match those filters.', 'Aucun prestataire ne correspond à ces filtres.', 'Nenhum prestador corresponde a esses filtros.'],
    ['Búsquedas populares:', 'Popular searches:', 'Recherches fréquentes :', 'Buscas populares:'],
    ['Portal Autogestion Compañias de Seguros', 'Insurance self-service portal', 'Portail d’assurance en libre-service', 'Portal de autoatendimento de seguros'],
    ['Versión', 'Version', 'Version', 'Versão'],
    ['Idioma', 'Language', 'Langue', 'Idioma'],
    ['Preferencias de idioma', 'Language preferences', 'Préférences linguistiques', 'Preferências de idioma'],
    ['Su idioma, a su manera', 'Your language, your choice', 'Votre langue, à votre façon', 'Seu idioma, sua escolha'],
    ['El portal permanece en español hasta que usted confirme el cambio.', 'The portal stays in Spanish until you confirm a change.', 'Le portail reste en espagnol tant que vous n’avez pas confirmé le changement.', 'O portal permanece em espanhol até você confirmar a mudança.'],
    ['Su navegador parece estar configurado en', 'Your browser appears to use', 'Votre navigateur semble utiliser', 'Seu navegador parece usar'],
    ['¿Desea usar este idioma en Dovela?', 'Would you like to use it on Dovela?', 'Souhaitez-vous l’utiliser sur Dovela ?', 'Deseja usar esse idioma na Dovela?'],
    ['Cambiar idioma', 'Switch language', 'Changer de langue', 'Mudar idioma'],
    ['Mantener español', 'Keep Spanish', 'Garder l’espagnol', 'Manter espanhol'],
    ['Usar mi ubicación para recomendar un idioma', 'Use my location to recommend a language', 'Utiliser ma position pour recommander une langue', 'Usar minha localização para recomendar um idioma'],
    ['La ubicación es opcional. Solo se usa en este dispositivo para recomendar un idioma; no se guarda ni se envía.', 'Location is optional. It is used only on this device to recommend a language and is never saved or sent.', 'La position est facultative. Elle sert uniquement sur cet appareil à recommander une langue ; elle n’est ni enregistrée ni transmise.', 'A localização é opcional. Ela é usada apenas neste dispositivo para recomendar um idioma e não é salva nem enviada.'],
    ['Consultando la ubicación del dispositivo…', 'Checking this device’s location…', 'Localisation de cet appareil en cours…', 'Verificando a localização do dispositivo…'],
    ['No pudimos acceder a su ubicación. Puede elegir un idioma o mantener español.', 'We couldn’t access your location. Choose a language or keep Spanish.', 'Nous n’avons pas pu accéder à votre position. Choisissez une langue ou gardez l’espagnol.', 'Não foi possível acessar sua localização. Escolha um idioma ou mantenha o espanhol.'],
    ['La ubicación sugiere', 'Your location suggests', 'Votre position suggère', 'Sua localização sugere'],
    ['La ubicación no ofrece una recomendación distinta. Puede mantener español o elegir otro idioma.', 'Your location does not suggest a different language. Keep Spanish or choose another language.', 'Votre position ne suggère pas une autre langue. Gardez l’espagnol ou choisissez une autre langue.', 'Sua localização não sugere outro idioma. Mantenha o espanhol ou escolha outra opção.'],
    ['Tenga a mano la documentación clínica y de facturación del paciente.', 'Have the patient’s clinical and billing documents ready.', 'Préparez les documents médicaux et de facturation du patient.', 'Tenha em mãos os documentos clínicos e de cobrança do paciente.'],
    ['Tenga a mano su cédula y los documentos del evento.', 'Have your ID and the supporting documents ready.', 'Préparez votre pièce d’identité et les justificatifs.', 'Tenha em mãos seu documento de identidade e os comprovantes.'],
    ['Presenta: Hospital / Clínica. Complete los datos del paciente asegurado y de su institución.', 'Submitted by: Hospital / Clinic. Enter the insured patient’s details and your facility’s information.', 'Déposé par : Hôpital / Clinique. Renseignez les coordonnées du patient assuré et de votre établissement.', 'Enviado por: Hospital / Clínica. Informe os dados do paciente segurado e da instituição.'],
    ['Presenta: Corredor de seguros. Complete los datos del asegurado.', 'Submitted by: Insurance broker. Enter the member’s details.', 'Déposé par : Courtier en assurance. Renseignez les coordonnées de l’assuré.', 'Enviado por: Corretor de seguros. Informe os dados do segurado.'],
    ['Presenta: Asegurado / Titular. Complete sus datos tal como aparecen en la póliza.', 'Submitted by: Member / Policyholder. Enter your details exactly as shown on the policy.', 'Déposé par : Assuré / Souscripteur. Renseignez vos coordonnées telles qu’elles figurent au contrat.', 'Enviado por: Segurado / Titular. Informe seus dados exatamente como aparecem na apólice.'],
    ['Correo de contacto (facturación)', 'Billing contact email', 'Adresse e-mail de facturation', 'E-mail de contato do faturamento'],
    ['Monto presentado (USD)', 'Amount submitted (USD)', 'Montant présenté (USD)', 'Valor apresentado (USD)'],
    ['Total facturado de la atención según los documentos adjuntos.', 'Total amount billed for the care shown in the attached documents.', 'Montant total facturé pour les soins selon les pièces jointes.', 'Valor total faturado pelo atendimento, conforme os documentos anexos.'],
    ['Ingrese el total de facturas/gastos de esta atención. Si no lo conoce, el especialista de indemnizaciones lo determinará según sus facturas y las condiciones de la póliza.', 'Enter the total invoices or expenses for this care. If you do not know it, a claims specialist will determine it from your invoices and policy terms.', 'Indiquez le total des factures ou frais liés à ces soins. Si vous ne le connaissez pas, un gestionnaire le déterminera à partir des factures et des conditions du contrat.', 'Informe o total das notas ou despesas deste atendimento. Se não souber, um analista determinará o valor com base nos comprovantes e nas condições da apólice.'],
    ['Por determinar', 'To be determined', 'À déterminer', 'A definir'],
    ['El archivo “{file}” supera el límite de {maxMB} MB.', 'The file “{file}” exceeds the {maxMB} MB limit.', 'Le fichier « {file} » dépasse la limite de {maxMB} Mo.', 'O arquivo “{file}” excede o limite de {maxMB} MB.'],
    ['Mostrar novedad {current} de {total}', 'Show highlight {current} of {total}', 'Afficher l’actualité {current} sur {total}', 'Mostrar novidade {current} de {total}'],
    ['Novedad {current} de {total}: {title}', 'Highlight {current} of {total}: {title}', 'Actualité {current} sur {total} : {title}', 'Novidade {current} de {total}: {title}'],
    ['Medicina general', 'General medicine', 'Médecine générale', 'Clínica geral'],
    ['Pediatría', 'Pediatrics', 'Pédiatrie', 'Pediatria'],
    ['Cardiología', 'Cardiology', 'Cardiologie', 'Cardiologia'],
    ['Ginecología', 'Gynecology', 'Gynécologie', 'Ginecologia'],
    ['Ortopedia', 'Orthopedics', 'Orthopédie', 'Ortopedia'],
    ['Oftalmología', 'Ophthalmology', 'Ophtalmologie', 'Oftalmologia'],
    ['Odontología', 'Dentistry', 'Odontologie', 'Odontologia'],
    ['Dermatología', 'Dermatology', 'Dermatologie', 'Dermatologia'],
    ['Ginecología y Obstetricia', 'Gynecology and obstetrics', 'Gynécologie et obstétrique', 'Ginecologia e obstetrícia'],
    ['Ciudad', 'City', 'Ville', 'Cidade'],
    ['Nombre', 'Name', 'Nom', 'Nome'],
    ['Red Médica', 'Provider Network', 'Réseau de soins', 'Rede credenciada'],
    ['Corte: {date} · {count} prestadores {scope}', 'Updated {date} · {count} providers {scope}', 'Mise à jour : {date} · {count} prestataires {scope}', 'Atualizado em {date} · {count} prestadores {scope}'],
    ['(filtrados)', '(filtered)', '(filtrés)', '(filtrados)'],
    ['(directorio completo)', '(full directory)', '(annuaire complet)', '(diretório completo)'],
    ['Página {current} de {total}', 'Page {current} of {total}', 'Page {current} sur {total}', 'Página {current} de {total}'],
    ['Página {current} de {total} · Dovela Seguros · Directorio con fines demostrativos', 'Page {current} of {total} · Dovela Insurance · Demonstration directory', 'Page {current} sur {total} · Dovela Assurances · Annuaire de démonstration', 'Página {current} de {total} · Dovela Seguros · Diretório para demonstração'],
    ['PDF generado con {count} prestadores', 'PDF created with {count} providers', 'PDF créé avec {count} prestataires', 'PDF gerado com {count} prestadores'],
    ['Excel generado con {count} prestadores', 'Spreadsheet created with {count} providers', 'Feuille de calcul créée avec {count} prestataires', 'Planilha gerada com {count} prestadores'],
    ['red_medica_dovela.pdf', 'dovela_provider_network.pdf', 'reseau_soins_dovela.pdf', 'rede_credenciada_dovela.pdf'],
    ['red_medica_dovela_filtrada.pdf', 'dovela_provider_network_filtered.pdf', 'reseau_soins_dovela_filtre.pdf', 'rede_credenciada_dovela_filtrada.pdf'],
    ['red_medica_dovela.xlsx', 'dovela_provider_network.xlsx', 'reseau_soins_dovela.xlsx', 'rede_credenciada_dovela.xlsx'],
    ['red_medica_dovela_filtrada.xlsx', 'dovela_provider_network_filtered.xlsx', 'reseau_soins_dovela_filtre.xlsx', 'rede_credenciada_dovela_filtrada.xlsx'],
    ['Comprobante de Recepción de Reclamo', 'Claim Receipt', 'Accusé de réception de la demande', 'Comprovante de recebimento do sinistro'],
    ['Comprobante', 'Receipt', 'Reçu', 'Comprovante'],
    ['Conserve este documento para futuras consultas.', 'Keep this document for future reference.', 'Conservez ce document pour vos prochaines consultations.', 'Guarde este documento para futuras consultas.'],
    ['Código de Reclamo', 'Claim Code', 'Code de la demande', 'Código do sinistro'],
    ['Cédula', 'ID number', 'Pièce d’identité', 'Documento de identidade'],
    ['Correo', 'Email', 'Adresse e-mail', 'E-mail'],
    ['Fecha del Evento', 'Date of Care', 'Date des soins', 'Data do atendimento'],
    ['Su reclamo ha sido recibido correctamente.\n\nEste comprobante confirma únicamente la recepción de la solicitud.\n\nConserve este documento hasta la resolución definitiva del caso.', 'Your claim was received successfully.\n\nThis receipt confirms only that the submission was received.\n\nKeep this document until the claim has been resolved.', 'Votre demande a bien été reçue.\n\nCe reçu confirme uniquement la réception du dossier.\n\nConservez ce document jusqu’à la décision définitive.', 'Seu sinistro foi recebido com sucesso.\n\nEste comprovante confirma apenas o recebimento da solicitação.\n\nGuarde este documento até a conclusão definitiva do caso.'],
    ['Portal de Reclamos Dovela Seguros • Generado automáticamente • Entidad ficticia con fines demostrativos', 'Dovela Insurance Claims Portal • Generated automatically • Fictional company for demonstration purposes', 'Portail de demandes Dovela Assurances • Généré automatiquement • Société fictive à des fins de démonstration', 'Portal de Sinistros Dovela Seguros • Gerado automaticamente • Empresa fictícia para fins de demonstração'],
    ['Comprobante_Reclamo_Dovela', 'Dovela_Claim_Receipt', 'Recu_Demande_Dovela', 'Comprovante_Sinistro_Dovela'],
    ['Portal de Autogestión Dovela', 'Dovela Self-service Portal', 'Espace en libre-service Dovela', 'Portal de autoatendimento Dovela'],
    ['Dovela Seguros · Entidad ficticia con fines demostrativos. Este formulario no constituye un contrato ni una cobertura real.', 'Dovela Insurance · Fictional company for demonstration purposes. This form is not a contract and does not provide actual coverage.', 'Dovela Assurances · Société fictive à des fins de démonstration. Ce formulaire ne constitue ni un contrat ni une couverture réelle.', 'Dovela Seguros · Empresa fictícia para fins de demonstração. Este formulário não constitui contrato nem cobertura real.'],
    ['Formulario de Reclamo de Gastos Médicos · Dovela Seguros', 'Medical Expense Claim Form · Dovela Insurance', 'Formulaire de remboursement de frais médicaux · Dovela Assurances', 'Formulário de reembolso de despesas médicas · Dovela Seguros'],
    ['Formulario de Reclamo de Gastos Médicos', 'Medical Expense Claim Form', 'Formulaire de remboursement de frais médicaux', 'Formulário de reembolso de despesas médicas'],
    ['Complete en letra de imprenta y firme al final del documento.', 'Complete in block letters and sign at the end of the document.', 'Remplissez en lettres capitales et signez à la fin du document.', 'Preencha em letra de forma e assine ao final do documento.'],
    ['Formulario DV-R01', 'Form DV-R01', 'Formulaire DV-R01', 'Formulário DV-R01'],
    ['Sección A · Póliza y asegurado', 'Section A · Policy and member', 'Section A · Contrat et assuré', 'Seção A · Apólice e segurado'],
    ['1. Número de póliza', '1. Policy number', '1. Numéro de contrat', '1. Número da apólice'],
    ['2. N.º de certificado', '2. Certificate no.', '2. N° de certificat', '2. Nº do certificado'],
    ['3. Teléfono celular', '3. Mobile phone', '3. Téléphone portable', '3. Celular'],
    ['4. Nombre completo del asegurado principal', '4. Primary member’s full name', '4. Nom complet de l’assuré principal', '4. Nome completo do segurado principal'],
    ['5. Correo electrónico', '5. Email address', '5. Adresse e-mail', '5. E-mail'],
    ['6. Nombre completo del paciente atendido', '6. Patient’s full name', '6. Nom complet du patient', '6. Nome completo do paciente atendido'],
    ['7. Cédula o pasaporte', '7. ID or passport', '7. Pièce d’identité ou passeport', '7. Documento de identidade ou passaporte'],
    ['8. Fecha de nacimiento (DD/MM/AAAA)', '8. Date of birth (MM/DD/YYYY)', '8. Date de naissance (JJ/MM/AAAA)', '8. Data de nascimento (DD/MM/AAAA)'],
    ['9. ¿El paciente tiene seguro con otra compañía?', '9. Does the patient have insurance with another company?', '9. Le patient est-il assuré auprès d’une autre compagnie ?', '9. O paciente possui seguro em outra empresa?'],
    ['Sí', 'Yes', 'Oui', 'Sim'],
    ['No', 'No', 'Non', 'Não'],
    ['Aseguradora', 'Insurance company', 'Compagnie d’assurance', 'Seguradora'],
    ['N.º de póliza', 'Policy no.', 'N° de contrat', 'Nº da apólice'],
    ['Fecha efectiva (DD/MM/AAAA)', 'Effective date (MM/DD/YYYY)', 'Date d’effet (JJ/MM/AAAA)', 'Data de vigência (DD/MM/AAAA)'],
    ['10. País de atención', '10. Country of care', '10. Pays des soins', '10. País do atendimento'],
    ['11. Ocupación', '11. Occupation', '11. Profession', '11. Ocupação'],
    ['Lugar de empleo o estudio', 'Employer or school', 'Lieu de travail ou d’études', 'Local de trabalho ou estudo'],
    ['Sección B · Información del evento', 'Section B · Incident details', 'Section B · Informations sur l’événement', 'Seção B · Informações do evento'],
    ['12. Reclamo por enfermedad: describa la condición y la fecha de los primeros síntomas', '12. Illness claim: describe the condition and date of first symptoms', '12. Demande pour maladie : décrivez l’affection et la date des premiers symptômes', '12. Sinistro por doença: descreva a condição e a data dos primeiros sintomas'],
    ['13. Reclamo por accidente: ¿dónde, cuándo (fecha y hora) y cómo ocurrió?', '13. Accident claim: where, when (date and time), and how did it happen?', '13. Demande pour accident : où, quand (date et heure) et comment est-il survenu ?', '13. Sinistro por acidente: onde, quando (data e hora) e como ocorreu?'],
    ['¿La persona responsable es un tercero?', 'Is a third party responsible?', 'Un tiers est-il responsable ?', 'O responsável é um terceiro?'],
    ['Nombre del responsable', 'Responsible party’s name', 'Nom du responsable', 'Nome do responsável'],
    ['N.º de póliza del responsable', 'Responsible party’s policy no.', 'N° de contrat du responsable', 'Nº da apólice do responsável'],
    ['14. ¿Recibió tratamiento previo por las lesiones o enfermedades descritas?', '14. Have you received previous treatment for the injuries or conditions described?', '14. Avez-vous déjà été traité pour les blessures ou affections décrites ?', '14. Recebeu tratamento anterior para as lesões ou doenças descritas?'],
    ['15. Clínica u hospital', '15. Clinic or hospital', '15. Clinique ou hôpital', '15. Clínica ou hospital'],
    ['Fecha de ingreso', 'Admission date', 'Date d’admission', 'Data de internação'],
    ['Médicos consultados', 'Physicians consulted', 'Médecins consultés', 'Médicos consultados'],
    ['Incapacidad', 'Disability', 'Incapacité', 'Incapacidade'],
    ['Total', 'Total', 'Totale', 'Total'],
    ['Parcial', 'Partial', 'Partielle', 'Parcial'],
    ['No aplica', 'Not applicable', 'Sans objet', 'Não se aplica'],
    ['Desde (DD/MM/AAAA)', 'From (MM/DD/YYYY)', 'Du (JJ/MM/AAAA)', 'De (DD/MM/AAAA)'],
    ['Hasta (DD/MM/AAAA)', 'To (MM/DD/YYYY)', 'Au (JJ/MM/AAAA)', 'Até (DD/MM/AAAA)'],
    ['Continuación', 'Continued', 'Suite', 'Continuação'],
    ['16. Detalle de cargos', '16. Itemized charges', '16. Détail des frais', '16. Detalhamento das despesas'],
    ['Monto · Consulta', 'Amount · Consultation', 'Montant · Consultation', 'Valor · Consulta'],
    ['Monto · Medicinas', 'Amount · Medication', 'Montant · Médicaments', 'Valor · Medicamentos'],
    ['Monto · Laboratorios', 'Amount · Laboratory tests', 'Montant · Analyses', 'Valor · Exames laboratoriais'],
    ['Monto · Imágenes (Rx / ultrasonido)', 'Amount · Imaging (X-ray / ultrasound)', 'Montant · Imagerie (radiographie / échographie)', 'Valor · Imagem (raio X / ultrassom)'],
    ['Monto · Terapias', 'Amount · Therapy', 'Montant · Thérapies', 'Valor · Terapias'],
    ['Monto · Otros', 'Amount · Other', 'Montant · Autres', 'Valor · Outros'],
    ['Total reclamado', 'Total claimed', 'Total demandé', 'Total solicitado'],
    ['Sección C · Médico tratante', 'Section C · Treating physician', 'Section C · Médecin traitant', 'Seção C · Médico responsável'],
    ['Diagnóstico', 'Diagnosis', 'Diagnostic', 'Diagnóstico'],
    ['Código de diagnóstico', 'Diagnosis code', 'Code du diagnostic', 'Código do diagnóstico'],
    ['Procedimientos realizados', 'Procedures performed', 'Actes réalisés', 'Procedimentos realizados'],
    ['Firma y sello del médico', 'Physician’s signature and stamp', 'Signature et cachet du médecin', 'Assinatura e carimbo do médico'],
    ['Fecha', 'Date', 'Date', 'Data'],
    ['Guía para presentar su reclamo', 'How to submit your claim', 'Guide de dépôt de votre demande', 'Como enviar seu sinistro'],
    ['Complete todas las secciones del formulario; los campos vacíos o ilegibles retrasan la evaluación.', 'Complete every section of the form; blank or illegible fields delay the review.', 'Remplissez toutes les sections du formulaire ; les champs vides ou illisibles retardent l’étude.', 'Preencha todas as seções do formulário; campos em branco ou ilegíveis atrasam a análise.'],
    ['Verifique que el médico haya indicado el diagnóstico y su código.', 'Make sure the physician included the diagnosis and its code.', 'Vérifiez que le médecin a indiqué le diagnostic et son code.', 'Confirme se o médico informou o diagnóstico e o respectivo código.'],
    ['Adjunte facturas o recibos originales con el detalle de cada medicamento, servicio o procedimiento.', 'Attach original invoices or receipts itemizing each medication, service, or procedure.', 'Joignez les factures ou reçus originaux détaillant chaque médicament, service ou acte.', 'Anexe notas fiscais ou recibos originais com o detalhamento de cada medicamento, serviço ou procedimento.'],
    ['Incluya las órdenes médicas, resultados de estudios y cualquier documento adicional que le sea solicitado.', 'Include medical orders, test results, and any additional document requested.', 'Joignez les prescriptions, les résultats d’examens et tout document complémentaire demandé.', 'Inclua pedidos médicos, resultados de exames e qualquer documento adicional solicitado.'],
    ['Presente el formulario firmado junto con sus documentos a través del portal de autogestión de Dovela.', 'Submit the signed form and supporting documents through the Dovela Self-service Portal.', 'Envoyez le formulaire signé et les justificatifs depuis l’espace en libre-service Dovela.', 'Envie o formulário assinado e os documentos pelo Portal de autoatendimento Dovela.'],
    ['Declaración del asegurado', 'Member declaration', 'Déclaration de l’assuré', 'Declaração do segurado'],
    ['Declaro que la información de este formulario es veraz y completa, y autorizo el tratamiento de mis datos personales y de salud únicamente para la evaluación de este reclamo.', 'I declare that the information in this form is true and complete, and I authorize the processing of my personal and health data solely to evaluate this claim.', 'Je certifie que les informations de ce formulaire sont exactes et complètes, et j’autorise le traitement de mes données personnelles et de santé uniquement aux fins d’étude de cette demande.', 'Declaro que as informações deste formulário são verdadeiras e completas e autorizo o tratamento dos meus dados pessoais e de saúde exclusivamente para a análise deste sinistro.'],
    ['Firma del asegurado', 'Member’s signature', 'Signature de l’assuré', 'Assinatura do segurado'],
    ['Cédula o pasaporte', 'ID or passport', 'Pièce d’identité ou passeport', 'Documento de identidade ou passaporte'],
    ['Formulario_Reclamo_Gastos_Medicos_Dovela.pdf', 'Dovela_Medical_Expense_Claim_Form.pdf', 'Formulaire_Frais_Medicaux_Dovela.pdf', 'Formulario_Reembolso_Despesas_Medicas_Dovela.pdf'],
    ['Solicitud de Pre-Autorización · Dovela Seguros', 'Pre-authorization Request · Dovela Insurance', 'Demande d’autorisation préalable · Dovela Assurances', 'Solicitação de autorização prévia · Dovela Seguros'],
    ['Solicitud de Pre-Autorización', 'Pre-authorization Request', 'Demande d’autorisation préalable', 'Solicitação de autorização prévia'],
    ['Hospitalización, procedimientos electivos y estudios especializados', 'Hospital stays, elective procedures, and specialist tests', 'Hospitalisation, actes programmés et examens spécialisés', 'Internações, procedimentos eletivos e exames especializados'],
    ['Formulario DV-P01', 'Form DV-P01', 'Formulaire DV-P01', 'Formulário DV-P01'],
    ['Marque el servicio solicitado', 'Select the requested service', 'Cochez le service demandé', 'Marque o serviço solicitado'],
    ['Hospitalización', 'Hospital stay', 'Hospitalisation', 'Internação'],
    ['Cirugía ambulatoria', 'Outpatient surgery', 'Chirurgie ambulatoire', 'Cirurgia ambulatorial'],
    ['Procedimiento especial ambulatorio', 'Special outpatient procedure', 'Acte ambulatoire spécialisé', 'Procedimento ambulatorial especial'],
    ['Examen especial intrahospitalario', 'Special inpatient test', 'Examen spécialisé en hospitalisation', 'Exame especial durante internação'],
    ['Rayos X y laboratorio', 'X-rays and laboratory tests', 'Radiographies et analyses', 'Raio X e exames laboratoriais'],
    ['Urgente', 'Urgent', 'Urgent', 'Urgente'],
    ['Extensión de días · número de días', 'Extension of stay · number of days', 'Prolongation du séjour · nombre de jours', 'Extensão da internação · número de dias'],
    ['Interconsulta hospitalaria · número de visitas', 'Inpatient consultation · number of visits', 'Avis spécialisé en hospitalisation · nombre de visites', 'Interconsulta hospitalar · número de visitas'],
    ['Motivo de la interconsulta o de la extensión de días', 'Reason for the consultation or extension of stay', 'Motif de l’avis spécialisé ou de la prolongation du séjour', 'Motivo da interconsulta ou da extensão da internação'],
    ['Asegurado y paciente', 'Member and patient', 'Assuré et patient', 'Segurado e paciente'],
    ['Nombre del asegurado', 'Member’s name', 'Nom de l’assuré', 'Nome do segurado'],
    ['Póliza n.º', 'Policy no.', 'Contrat n°', 'Apólice nº'],
    ['Nombre del paciente', 'Patient’s name', 'Nom du patient', 'Nome do paciente'],
    ['Fecha de nacimiento', 'Date of birth', 'Date de naissance', 'Data de nascimento'],
    ['Edad', 'Age', 'Âge', 'Idade'],
    ['Parentesco', 'Relationship', 'Lien avec l’assuré', 'Parentesco'],
    ['Sexo', 'Sex', 'Sexe', 'Sexo'],
    ['Femenino', 'Female', 'Féminin', 'Feminino'],
    ['Masculino', 'Male', 'Masculin', 'Masculino'],
    ['Cédula o pasaporte del paciente', 'Patient ID or passport', 'Pièce d’identité ou passeport du patient', 'Documento de identidade ou passaporte do paciente'],
    ['Dirección y teléfono', 'Address and phone', 'Adresse et téléphone', 'Endereço e telefone'],
    ['Información médica', 'Medical information', 'Informations médicales', 'Informações médicas'],
    ['Historia clínica breve, antecedentes y fechas', 'Brief medical history, background, and dates', 'Résumé clinique, antécédents et dates', 'Breve histórico clínico, antecedentes e datas'],
    ['Otras condiciones declaradas', 'Other reported conditions', 'Autres affections déclarées', 'Outras condições declaradas'],
    ['Procedimiento solicitado', 'Requested procedure', 'Acte demandé', 'Procedimento solicitado'],
    ['Código del procedimiento', 'Procedure code', 'Code de l’acte', 'Código do procedimento'],
    ['Pruebas diagnósticas realizadas y tratamiento aplicado (adjunte copia de los resultados)', 'Diagnostic tests performed and treatment provided (attach a copy of the results)', 'Examens diagnostiques réalisés et traitement administré (joignez une copie des résultats)', 'Exames diagnósticos realizados e tratamento aplicado (anexe uma cópia dos resultados)'],
    ['¿Requiere servicio de anestesia?', 'Is anesthesia required?', 'Une anesthésie est-elle nécessaire ?', 'Requer serviço de anestesia?'],
    ['Hospital: nombre y dirección', 'Hospital: name and address', 'Hôpital : nom et adresse', 'Hospital: nome e endereço'],
    ['Teléfono del hospital', 'Hospital phone', 'Téléphone de l’hôpital', 'Telefone do hospital'],
    ['Fecha sugerida de ingreso', 'Proposed admission date', 'Date d’admission prévue', 'Data sugerida de internação'],
    ['Reclusión estimada (días)', 'Estimated stay (days)', 'Durée prévue du séjour (jours)', 'Tempo estimado de internação (dias)'],
    ['Registro médico', 'Medical license no.', 'N° d’inscription professionnelle', 'Registro profissional'],
    ['Médico tratante', 'Treating physician', 'Médecin traitant', 'Médico responsável'],
    ['Nombre del médico', 'Physician’s name', 'Nom du médecin', 'Nome do médico'],
    ['Enviar confirmación a', 'Send confirmation to', 'Envoyer la confirmation à', 'Enviar confirmação para'],
    ['Notas importantes', 'Important notes', 'Remarques importantes', 'Observações importantes'],
    ['Para cirugías y procedimientos electivos, envíe esta solicitud con al menos tres (3) días hábiles de anticipación a la fecha sugerida.', 'For elective surgeries and procedures, submit this request at least three (3) business days before the proposed date.', 'Pour les interventions et actes programmés, envoyez cette demande au moins trois (3) jours ouvrés avant la date prévue.', 'Para cirurgias e procedimentos eletivos, envie esta solicitação com pelo menos três (3) dias úteis de antecedência da data sugerida.'],
    ['En casos urgentes, envíe la solicitud de inmediato a través del portal de autogestión de Dovela.', 'In urgent cases, submit the request immediately through the Dovela Self-service Portal.', 'En cas d’urgence, envoyez immédiatement la demande depuis l’espace en libre-service Dovela.', 'Em casos urgentes, envie a solicitação imediatamente pelo Portal de autoatendimento Dovela.'],
    ['Antes de referir al paciente o de realizar el estudio solicitado, se requiere la autorización escrita de Dovela Seguros.', 'Written authorization from Dovela Insurance is required before referring the patient or performing the requested test.', 'L’autorisation écrite de Dovela Assurances est requise avant d’orienter le patient ou de réaliser l’examen demandé.', 'É necessária autorização por escrito da Dovela Seguros antes de encaminhar o paciente ou realizar o exame solicitado.'],
    ['Los resultados de los estudios serán revisados por el equipo médico evaluador; inclúyalos con la solicitud.', 'The medical review team will review the test results; include them with the request.', 'Les résultats seront examinés par l’équipe médicale ; joignez-les à la demande.', 'Os resultados dos exames serão analisados pela equipe médica; inclua-os na solicitação.'],
    ['La pre-autorización emitida tiene una vigencia de treinta (30) días.', 'An issued pre-authorization is valid for thirty (30) days.', 'L’autorisation préalable délivrée est valable trente (30) jours.', 'A autorização prévia emitida é válida por trinta (30) dias.'],
    ['Autorizo a Dovela Seguros a tratar mis datos personales y de salud únicamente para la evaluación de esta solicitud.', 'I authorize Dovela Insurance to process my personal and health data solely to evaluate this request.', 'J’autorise Dovela Assurances à traiter mes données personnelles et de santé uniquement aux fins d’étude de cette demande.', 'Autorizo a Dovela Seguros a tratar meus dados pessoais e de saúde exclusivamente para a análise desta solicitação.'],
    ['Formulario_PreAutorizacion_Dovela.pdf', 'Dovela_Benefits_Preauthorization_Form.pdf', 'Formulaire_Autorisation_Prealable_Dovela.pdf', 'Formulario_Autorizacao_Previa_Dovela.pdf'],
    ['¿Aún no tiene el formulario?', 'Do you still need the form?', 'Vous n’avez pas encore le formulaire ?', 'Ainda não tem o formulário?'],
    ['¿Necesita el formulario?', 'Need the form?', 'Besoin du formulaire ?', 'Precisa do formulário?'],
    [', complételo con su médico y cárguelo abajo.', ', complete it with your physician, then upload it below.', ', remplissez-le avec votre médecin, puis importez-le ci-dessous.', ', preencha-o com seu médico e anexe-o abaixo.'],
    [', complételo, fírmelo y cárguelo abajo.', ', complete and sign it, then upload it below.', ', remplissez-le, signez-le, puis importez-le ci-dessous.', ', preencha, assine e anexe abaixo.'],
    [', o', ', or', ', ou', ', ou'],
    ['Descargue aquí el Formulario de Pre-Autorización de Beneficios Dovela', 'Download the Dovela Benefits Pre-authorization Form here', 'Téléchargez ici le formulaire d’autorisation préalable Dovela', 'Baixe aqui o Formulário de autorização prévia Dovela'],
    ['Descargue aquí el Formulario de Reclamos de Gastos Médicos', 'Download the Medical Expense Claim Form here', 'Téléchargez ici le formulaire de remboursement de frais médicaux', 'Baixe aqui o Formulário de reembolso de despesas médicas'],
    ['Cargue todos los documentos marcados como obligatorios.', 'Upload every document marked as required.', 'Importez tous les documents indiqués comme obligatoires.', 'Anexe todos os documentos marcados como obrigatórios.'],
    ['Guía para fotos legibles:', 'Tips for readable photos:', 'Conseils pour des photos lisibles :', 'Dicas para fotos legíveis:'],
    ['use buena luz, capture el documento completo sin dedos ni sombras, y verifique que los montos y nombres se lean con claridad. Puede cargar archivos', 'use good lighting, capture the entire document without fingers or shadows, and check that amounts and names are easy to read. You can upload', 'utilisez un bon éclairage, photographiez le document entier sans doigts ni ombres, et vérifiez que les montants et les noms sont lisibles. Vous pouvez importer des fichiers', 'use boa iluminação, fotografe o documento inteiro sem dedos ou sombras e verifique se valores e nomes estão legíveis. Você pode anexar arquivos'],
    ['o tomar la foto directamente con la cámara. En facturas y resultados puede adjuntar', 'or take a photo directly with the camera. You can attach', 'ou prendre directement une photo. Pour les factures et les résultats, vous pouvez joindre', 'ou tirar a foto diretamente com a câmera. Para notas e resultados, você pode anexar'],
    ['PDF, JPG o PNG', 'PDF, JPG, or PNG', 'PDF, JPG ou PNG', 'PDF, JPG ou PNG'],
    ['Obligatorio · PDF, JPG o PNG · max. 10 MB', 'Required · PDF, JPG, or PNG · max. 10 MB', 'Obligatoire · PDF, JPG ou PNG · 10 Mo max.', 'Obrigatório · PDF, JPG ou PNG · máx. 10 MB'],
    ['Obligatorio · varios archivos · PDF, JPG o PNG · max. 20 MB', 'Required · multiple files · PDF, JPG, or PNG · max. 20 MB', 'Obligatoire · plusieurs fichiers · PDF, JPG ou PNG · 20 Mo max.', 'Obrigatório · vários arquivos · PDF, JPG ou PNG · máx. 20 MB'],
    ['Opcional · PDF, JPG o PNG · max. 10 MB', 'Optional · PDF, JPG, or PNG · max. 10 MB', 'Facultatif · PDF, JPG ou PNG · 10 Mo max.', 'Opcional · PDF, JPG ou PNG · máx. 10 MB'],
    ['Opcional · varios archivos · PDF, JPG o PNG · max. 20 MB', 'Optional · multiple files · PDF, JPG, or PNG · max. 20 MB', 'Facultatif · plusieurs fichiers · PDF, JPG ou PNG · 20 Mo max.', 'Opcional · vários arquivos · PDF, JPG ou PNG · máx. 20 MB'],
    ['Aparece en su póliza o certificado. Si no lo conoce, elija "No estoy seguro" y el especialista lo validará.', 'It appears on your policy or certificate. If you do not know it, choose “I’m not sure” and a specialist will verify it.', 'Il figure sur votre contrat ou certificat. Si vous ne le connaissez pas, choisissez « Je ne sais pas » ; un gestionnaire le vérifiera.', 'Ele consta na apólice ou no certificado. Se não souber, escolha “Não tenho certeza” e um analista fará a validação.'],
    ['Cuéntenos brevemente qué ocurrió: diagnóstico, atención recibida o circunstancias del evento.', 'Briefly tell us what happened: diagnosis, care received, or circumstances of the incident.', 'Décrivez brièvement ce qui s’est passé : diagnostic, soins reçus ou circonstances de l’événement.', 'Conte brevemente o que aconteceu: diagnóstico, atendimento recebido ou circunstâncias do evento.'],
    ['Describa brevemente el evento.', 'Briefly describe the incident.', 'Décrivez brièvement l’événement.', 'Descreva brevemente o evento.'],
    ['Escriba el nombre del asegurado.', 'Enter the member’s name.', 'Saisissez le nom de l’assuré.', 'Informe o nome do segurado.'],
    ['Escriba la cédula o pasaporte.', 'Enter the ID or passport.', 'Saisissez la pièce d’identité ou le passeport.', 'Informe o documento de identidade ou passaporte.'],
    ['Escriba un correo válido.', 'Enter a valid email address.', 'Saisissez une adresse e-mail valide.', 'Informe um e-mail válido.'],
    ['Indique el monto.', 'Enter the amount.', 'Indiquez le montant.', 'Informe o valor.'],
    ['Indique una fecha válida dentro de los últimos 365 días.', 'Enter a valid date within the past 365 days.', 'Indiquez une date valide au cours des 365 derniers jours.', 'Informe uma data válida dos últimos 365 dias.'],
    ['Solo se aceptan atenciones dentro de los últimos 365 días. No hay cobertura para facturas con fecha mayor a un año desde la radicación.', 'Only care received within the past 365 days is accepted. Invoices dated more than one year before submission are not covered.', 'Seuls les soins reçus au cours des 365 derniers jours sont acceptés. Les factures datant de plus d’un an au moment du dépôt ne sont pas couvertes.', 'São aceitos apenas atendimentos dos últimos 365 dias. Não há cobertura para notas com mais de um ano na data do envio.'],
    ['Declaro que la información es veraz y otorgo consentimiento expreso a Dovela Seguros para el tratamiento de mis datos personales, incluidos datos de salud, conforme a la normativa de protección de datos aplicable y únicamente para la gestión de esta solicitud.', 'I confirm that this information is true and expressly consent to Dovela Insurance processing my personal data, including health data, solely to manage this request and in accordance with applicable data protection law.', 'Je certifie l’exactitude de ces informations et consens expressément à ce que Dovela Assurances traite mes données personnelles, y compris mes données de santé, uniquement pour gérer cette demande et conformément à la réglementation applicable.', 'Declaro que as informações são verdadeiras e autorizo expressamente a Dovela Seguros a tratar meus dados pessoais, inclusive dados de saúde, exclusivamente para esta solicitação e conforme a legislação aplicável.'],
    ['Debe aceptar la declaración para enviar.', 'Accept the declaration before submitting.', 'Vous devez accepter la déclaration avant l’envoi.', 'Aceite a declaração antes de enviar.'],
    ['Este comprobante confirma únicamente la recepción del reclamo. No representa aprobación de cobertura. Conserve este documento.', 'This receipt confirms only that the claim was received. It does not confirm coverage approval. Keep this document.', 'Ce reçu confirme uniquement la réception de la demande. Il ne vaut pas accord de prise en charge. Conservez ce document.', 'Este comprovante confirma apenas o recebimento do sinistro. Não representa aprovação de cobertura. Guarde este documento.'],
    ['Guarde este número. Le enviamos un acuse al correo registrado. Puede consultar el avance en cualquier momento con su radicado y su cédula o correo.', 'Keep this number. We sent a receipt to the registered email. You can check progress at any time using the tracking number and your ID or email.', 'Conservez ce numéro. Un accusé a été envoyé à l’adresse e-mail enregistrée. Vous pouvez suivre l’avancement avec ce numéro et votre pièce d’identité ou adresse e-mail.', 'Guarde este número. Enviamos um comprovante ao e-mail cadastrado. Você pode acompanhar o andamento com o protocolo e seu documento ou e-mail.'],
    ['Documentos requeridos', 'Required documents', 'Documents requis', 'Documentos obrigatórios'],
    ['Documentos cargados', 'Documents uploaded', 'Documents importés', 'Documentos anexados'],
    ['Descripción', 'Description', 'Description', 'Descrição'],
    ['Monto reclamado', 'Amount claimed', 'Montant demandé', 'Valor solicitado'],
    ['Código:', 'Code:', 'Code :', 'Código:'],
    ['Formulario de Pre-Autorización de Beneficios Dovela, completado y firmado', 'Completed and signed Dovela Benefits Pre-authorization Form', 'Formulaire d’autorisation préalable Dovela rempli et signé', 'Formulário de autorização prévia Dovela preenchido e assinado'],
    ['Formulario de Reclamos de Gastos Médicos firmado', 'Signed Medical Expense Claim Form', 'Formulaire de remboursement de frais médicaux signé', 'Formulário de reembolso de despesas médicas assinado'],
    ['Facturas y recibos originales', 'Original invoices and receipts', 'Factures et reçus originaux', 'Notas fiscais e recibos originais'],
    ['Informe o receta médica', 'Medical report or prescription', 'Compte rendu ou ordonnance médicale', 'Relatório ou receita médica'],
    ['Resultados de exámenes / laboratorio', 'Test / laboratory results', 'Résultats d’examens / analyses', 'Resultados de exames / laboratório'],
    ['Factura hospitalaria detallada', 'Itemized hospital invoice', 'Facture hospitalière détaillée', 'Nota hospitalar detalhada'],
    ['Informe médico / epicrisis', 'Medical report / discharge summary', 'Compte rendu médical / de sortie', 'Relatório médico / resumo de alta'],
    ['Formulario de reclamos (Sección C – médico proveedor)', 'Claim form (Section C – treating provider)', 'Formulaire de demande (section C – professionnel de santé)', 'Formulário de sinistro (Seção C – profissional de saúde)'],
    ['Pre-autorización (si aplica)', 'Pre-authorization (if applicable)', 'Autorisation préalable (le cas échéant)', 'Autorização prévia (se aplicável)'],
    ['Identificación del paciente', 'Patient identification', 'Pièce d’identité du patient', 'Identificação do paciente'],
    ['Informe médico', 'Medical report', 'Compte rendu médical', 'Relatório médico'],
    ['Informe de atención o reporte de coordinación (SEMM)', 'Care report or coordination report (SEMM)', 'Compte rendu de soins ou de coordination (SEMM)', 'Relatório de atendimento ou coordenação (SEMM)'],
    ['Facturas de gastos médicos', 'Medical expense invoices', 'Factures de frais médicaux', 'Notas de despesas médicas'],
    ['Informe de accidente (tránsito / laboral, si aplica)', 'Accident report (traffic / workplace, if applicable)', 'Rapport d’accident (circulation / travail, le cas échéant)', 'Relatório de acidente (trânsito / trabalho, se aplicável)'],
    ['Factura detallada de la atención', 'Itemized care invoice', 'Facture détaillée des soins', 'Nota detalhada do atendimento'],
    ['Informe de atención médica', 'Medical care report', 'Compte rendu des soins', 'Relatório de atendimento médico'],
    ['Reporte de coordinación (SEMM, si aplica)', 'Coordination report (SEMM, if applicable)', 'Rapport de coordination (SEMM, le cas échéant)', 'Relatório de coordenação (SEMM, se aplicável)'],
    ['Orden médica', 'Medical order', 'Prescription médicale', 'Pedido médico'],
    ['Informe del médico tratante (cuadro clínico, diagnóstico y procedimientos)', 'Treating physician’s report (clinical presentation, diagnosis, and procedures)', 'Compte rendu du médecin traitant (tableau clinique, diagnostic et actes)', 'Relatório do médico responsável (quadro clínico, diagnóstico e procedimentos)'],
    ['Aviso de operación', 'Operating license', 'Autorisation d’exploitation', 'Licença de funcionamento'],
    ['Idoneidad / registro sanitario', 'Professional license / health registration', 'Autorisation professionnelle / inscription sanitaire', 'Habilitação profissional / registro sanitário'],
    ['Cédula o RUC (copia)', 'ID or tax ID (copy)', 'Pièce d’identité ou identifiant fiscal (copie)', 'Documento ou CNPJ (cópia)'],
    ['Certificación bancaria', 'Bank certificate', 'Attestation bancaire', 'Comprovante bancário'],
    ['Diploma de Especialidad', 'Specialty diploma', 'Diplôme de spécialité', 'Diploma de especialidade'],
    ['Tarifario de servicios', 'Service fee schedule', 'Grille tarifaire des services', 'Tabela de preços dos serviços'],
    ['Diploma de Subespecialidad', 'Subspecialty diploma', 'Diplôme de surspécialité', 'Diploma de subespecialidade'],
    ['Formulario de Pre-Autorización de Beneficios Dovela, completado y firmado *', 'Completed and signed Dovela Benefits Pre-authorization Form *', 'Formulaire d’autorisation préalable Dovela rempli et signé *', 'Formulário de autorização prévia Dovela preenchido e assinado *'],
    ['Formulario de reclamos (Sección C – médico proveedor) *', 'Claim form (Section C – treating provider) *', 'Formulaire de demande (section C – professionnel de santé) *', 'Formulário de sinistro (Seção C – profissional de saúde) *'],
    ['Factura hospitalaria detallada *', 'Itemized hospital invoice *', 'Facture hospitalière détaillée *', 'Nota hospitalar detalhada *'],
    ['Informe médico / epicrisis *', 'Medical report / discharge summary *', 'Compte rendu médical / de sortie *', 'Relatório médico / resumo de alta *'],
    ['Identificación del paciente *', 'Patient identification *', 'Pièce d’identité du patient *', 'Identificação do paciente *'],
    ['Orden médica *', 'Medical order *', 'Prescription médicale *', 'Pedido médico *'],
    ['Informe del médico tratante (cuadro clínico, diagnóstico y procedimientos) *', 'Treating physician’s report (clinical presentation, diagnosis, and procedures) *', 'Compte rendu du médecin traitant (tableau clinique, diagnostic et actes) *', 'Relatório do médico responsável (quadro clínico, diagnóstico e procedimentos) *'],
    ['Aviso de operación *', 'Operating license *', 'Autorisation d’exploitation *', 'Licença de funcionamento *'],
    ['Idoneidad / registro sanitario *', 'Professional license / health registration *', 'Autorisation professionnelle / inscription sanitaire *', 'Habilitação profissional / registro sanitário *'],
    ['Cédula o RUC (copia) *', 'ID or tax ID (copy) *', 'Pièce d’identité ou identifiant fiscal (copie) *', 'Documento ou CNPJ (cópia) *'],
    ['Certificación bancaria *', 'Bank certificate *', 'Attestation bancaire *', 'Comprovante bancário *'],
    ['Diploma de Especialidad *', 'Specialty diploma *', 'Diplôme de spécialité *', 'Diploma de especialidade *'],
    ['Solicitud de pre-autorización médica', 'Medical pre-authorization request', 'Demande d’autorisation médicale préalable', 'Solicitação de autorização médica prévia'],
    ['Para hospitalización, cirugías electivas, procedimientos y estudios especializados.', 'For hospital stays, elective surgery, procedures, and specialist tests.', 'Pour une hospitalisation, une intervention programmée, un acte ou un examen spécialisé.', 'Para internações, cirurgias eletivas, procedimentos e exames especializados.'],
    ['Tipo de solicitud', 'Request type', 'Type de demande', 'Tipo de solicitação'],
    ['Examen y/o procedimiento especial ambulatorio', 'Special outpatient test and/or procedure', 'Examen et/ou acte ambulatoire spécialisé', 'Exame e/ou procedimento ambulatorial especial'],
    ['Rayos X y laboratorios', 'X-rays and laboratory tests', 'Radiographies et analyses', 'Raio X e exames laboratoriais'],
    ['Correo para la confirmación', 'Confirmation email', 'Adresse e-mail de confirmation', 'E-mail para confirmação'],
    ['Hospital / centro donde se realizará', 'Hospital / facility where care will take place', 'Hôpital / établissement prévu', 'Hospital / local onde será realizado'],
    ['Fecha sugerida de ingreso o del procedimiento', 'Proposed admission or procedure date', 'Date prévue d’admission ou de l’acte', 'Data sugerida de internação ou do procedimento'],
    ['Nombre del asegurado titular', 'Policyholder’s name', 'Nom du souscripteur assuré', 'Nome do segurado titular'],
    ['Indique el asegurado titular.', 'Enter the policyholder.', 'Indiquez le souscripteur assuré.', 'Informe o segurado titular.'],
    ['Indique el paciente.', 'Enter the patient.', 'Indiquez le patient.', 'Informe o paciente.'],
    ['Parentesco con el asegurado', 'Relationship to the member', 'Lien avec l’assuré', 'Parentesco com o segurado'],
    ['Titular', 'Policyholder', 'Souscripteur', 'Titular'],
    ['Cónyuge', 'Spouse', 'Conjoint', 'Cônjuge'],
    ['Hijo(a)', 'Child', 'Enfant', 'Filho(a)'],
    ['Otro', 'Other', 'Autre', 'Outro'],
    ['Diagnóstico y procedimientos requeridos', 'Diagnosis and requested procedures', 'Diagnostic et actes demandés', 'Diagnóstico e procedimentos solicitados'],
    ['Describa el cuadro clínico, diagnóstico y los procedimientos solicitados (según el informe del médico tratante).', 'Describe the clinical presentation, diagnosis, and requested procedures, based on the treating physician’s report.', 'Décrivez le tableau clinique, le diagnostic et les actes demandés, selon le compte rendu du médecin traitant.', 'Descreva o quadro clínico, o diagnóstico e os procedimentos solicitados, conforme o relatório do médico responsável.'],
    ['Describa el diagnóstico y los procedimientos.', 'Describe the diagnosis and procedures.', 'Décrivez le diagnostic et les actes.', 'Descreva o diagnóstico e os procedimentos.'],
    ['Indique el hospital o clínica.', 'Enter the hospital or clinic.', 'Indiquez l’hôpital ou la clinique.', 'Informe o hospital ou a clínica.'],
    ['Indique el médico tratante.', 'Enter the treating physician.', 'Indiquez le médecin traitant.', 'Informe o médico responsável.'],
    ['Autorizo a Dovela Seguros a tratar mis datos personales y de salud para la evaluación de esta pre-autorización, conforme a la normativa vigente.', 'I authorize Dovela Insurance to process my personal and health data to evaluate this pre-authorization request, in accordance with applicable law.', 'J’autorise Dovela Assurances à traiter mes données personnelles et de santé aux fins d’étude de cette demande, conformément à la réglementation applicable.', 'Autorizo a Dovela Seguros a tratar meus dados pessoais e de saúde para analisar esta autorização prévia, conforme a legislação vigente.'],
    ['Importante:', 'Important:', 'Important :', 'Importante:'],
    ['para cirugías electivas, someta esta solicitud', 'for elective surgery, submit this request', 'pour une intervention programmée, envoyez cette demande', 'para cirurgias eletivas, envie esta solicitação'],
    ['al menos 3 días antes', 'at least 3 days before', 'au moins 3 jours avant', 'com pelo menos 3 dias de antecedência'],
    ['de la fecha sugerida. La pre-autorización es válida por', 'the proposed date. A pre-authorization is valid for', 'la date prévue. L’autorisation préalable est valable', 'da data sugerida. A autorização prévia é válida por'],
    ['30 días', '30 days', '30 jours', '30 dias'],
    ['. En casos urgentes, envíe esta solicitud de inmediato desde el portal.', '. In urgent cases, submit this request immediately through the portal.', '. En cas d’urgence, envoyez immédiatement cette demande depuis le portail.', '. Em casos urgentes, envie esta solicitação imediatamente pelo portal.'],
    ['Nuestros médicos asesores evaluarán su solicitud. Recibirá la confirmación al correo indicado. Recuerde: antes de referir al paciente al hospital o realizar el estudio, debe tener la autorización escrita de Dovela Seguros.', 'Our medical advisors will review your request. Confirmation will be sent to the email provided. Remember: you need written authorization from Dovela Insurance before referring the patient to the hospital or performing the test.', 'Nos médecins-conseils étudieront votre demande. La confirmation sera envoyée à l’adresse indiquée. Rappel : l’autorisation écrite de Dovela Assurances est requise avant d’orienter le patient vers l’hôpital ou de réaliser l’examen.', 'Nossos médicos consultores analisarão a solicitação. A confirmação será enviada ao e-mail informado. Lembre-se: é necessária autorização por escrito da Dovela Seguros antes de encaminhar o paciente ao hospital ou realizar o exame.'],
    ['Solicitud de pre-autorización recibida', 'Pre-authorization request received', 'Demande d’autorisation préalable reçue', 'Solicitação de autorização prévia recebida'],
    ['Enviar solicitud →', 'Submit request →', 'Envoyer la demande →', 'Enviar solicitação →'],
    ['Registro de nuevos proveedores', 'New provider registration', 'Inscription de nouveaux prestataires', 'Cadastro de novos prestadores'],
    ['Para hospitales, clínicas, laboratorios y médicos que desean afiliarse a la red de Dovela Seguros. Complete el expediente en un solo envío; el equipo de Red Médica revisará su solicitud.', 'For hospitals, clinics, laboratories, and physicians seeking to join the Dovela Insurance network. Submit the complete file at once; the Provider Network team will review it.', 'Pour les hôpitaux, cliniques, laboratoires et médecins souhaitant rejoindre le réseau Dovela. Envoyez le dossier complet en une seule fois ; l’équipe Réseau de soins l’examinera.', 'Para hospitais, clínicas, laboratórios e médicos que desejam fazer parte da rede Dovela. Envie o dossiê completo de uma só vez; a equipe da Rede Credenciada fará a análise.'],
    ['Tipo de proveedor', 'Provider type', 'Type de prestataire', 'Tipo de prestador'],
    ['Hospital / clínica', 'Hospital / clinic', 'Hôpital / clinique', 'Hospital / clínica'],
    ['Médico especialista', 'Specialist physician', 'Médecin spécialiste', 'Médico especialista'],
    ['Laboratorio / imágenes', 'Laboratory / imaging center', 'Laboratoire / centre d’imagerie', 'Laboratório / centro de imagem'],
    ['Farmacia', 'Pharmacy', 'Pharmacie', 'Farmácia'],
    ['Razón social / nombre', 'Legal name / name', 'Raison sociale / nom', 'Razão social / nome'],
    ['RUC / cédula', 'Tax ID / personal ID', 'Identifiant fiscal / pièce d’identité', 'CNPJ / documento de identidade'],
    ['Persona de contacto', 'Contact person', 'Personne à contacter', 'Pessoa de contato'],
    ['Provincia / dirección', 'Province / address', 'Province / adresse', 'Província / endereço'],
    ['Especialidad / servicios', 'Specialty / services', 'Spécialité / services', 'Especialidade / serviços'],
    ['Posee subespecialidad', 'Has a subspecialty', 'Possède une surspécialité', 'Possui subespecialidade'],
    ['Nombre de la subespecialidad', 'Subspecialty name', 'Nom de la surspécialité', 'Nome da subespecialidade'],
    ['Documentos del expediente', 'Application documents', 'Pièces du dossier', 'Documentos do cadastro'],
    ['Escriba la razón social.', 'Enter the legal name.', 'Saisissez la raison sociale.', 'Informe a razão social.'],
    ['Escriba el RUC.', 'Enter the tax ID.', 'Saisissez l’identifiant fiscal.', 'Informe o CNPJ.'],
    ['Escriba un teléfono de contacto.', 'Enter a contact phone number.', 'Saisissez un numéro de téléphone.', 'Informe um telefone de contato.'],
    ['Indique un contacto.', 'Enter a contact person.', 'Indiquez une personne à contacter.', 'Informe uma pessoa de contato.'],
    ['Indique la especialidad.', 'Enter the specialty.', 'Indiquez la spécialité.', 'Informe a especialidade.'],
    ['Seleccione el tipo.', 'Choose a provider type.', 'Choisissez le type de prestataire.', 'Escolha o tipo de prestador.'],
    ['Solicitud recibida', 'Request received', 'Demande reçue', 'Solicitação recebida'],
    ['El equipo de Red Médica revisará su expediente y le contactará al correo registrado.', 'The Provider Network team will review your application and contact you at the registered email.', 'L’équipe Réseau de soins examinera votre dossier et vous contactera à l’adresse e-mail enregistrée.', 'A equipe da Rede Credenciada analisará seu cadastro e entrará em contato pelo e-mail informado.'],
    ['Correo requerido.', 'Email is required.', 'L’adresse e-mail est obligatoire.', 'O e-mail é obrigatório.'],
    ['Correo válido requerido.', 'Enter a valid email address.', 'Saisissez une adresse e-mail valide.', 'Informe um e-mail válido.'],
    ['Teléfono requerido.', 'Phone number is required.', 'Le numéro de téléphone est obligatoire.', 'O telefone é obrigatório.'],
    ['Consultar', 'Check', 'Consulter', 'Consultar'],
    ['Seguir mi solicitud', 'Track my request', 'Suivre ma demande', 'Acompanhar minha solicitação'],
    ['Número de radicado', 'Tracking number', 'Numéro de suivi', 'Número de protocolo'],
    ['Cédula o correo del asegurado', 'Member ID or email', 'Pièce d’identité ou adresse e-mail de l’assuré', 'Documento ou e-mail do segurado'],
    ['Funciona para reclamos (SGP-…) y pre-autorizaciones (PA-…).', 'Works for claims (SGP-…) and pre-authorizations (PA-…).', 'Valable pour les demandes (SGP-…) et les autorisations préalables (PA-…).', 'Funciona para sinistros (SGP-…) e autorizações prévias (PA-…).'],
    ['Introduzca su código de seguimiento y el correo registrado al presentar el reclamo para consultar su estado.', 'Enter your tracking code and the email used when submitting the claim to check its status.', 'Saisissez votre code de suivi et l’adresse e-mail utilisée lors du dépôt pour consulter le statut.', 'Informe o código de acompanhamento e o e-mail usado no envio para consultar o andamento.'],
    ['No encontramos una solicitud con esos datos. Verifique el radicado y su identificación.', 'We could not find a request matching those details. Check the tracking number and identification.', 'Aucune demande ne correspond à ces informations. Vérifiez le numéro de suivi et l’identification.', 'Não encontramos uma solicitação com esses dados. Confira o protocolo e a identificação.'],
    ['Marcar como', 'Set status to', 'Définir le statut sur', 'Alterar status para'],
    ['Descargar completo (Excel)', 'Download full directory (Excel)', 'Télécharger l’annuaire complet (Excel)', 'Baixar diretório completo (Excel)'],
    ['Descargar directorio completo (PDF)', 'Download full directory (PDF)', 'Télécharger l’annuaire complet (PDF)', 'Baixar diretório completo (PDF)'],
    ['Exportar resultados filtrados (PDF)', 'Export filtered results (PDF)', 'Exporter les résultats filtrés (PDF)', 'Exportar resultados filtrados (PDF)'],
    ['Exportar filtrados (Excel)', 'Export filtered results (Excel)', 'Exporter les résultats filtrés (Excel)', 'Exportar resultados filtrados (Excel)'],
    ['Directorio de prestadores con fines demostrativos. Corte:', 'Demonstration provider directory. Updated:', 'Annuaire de prestataires à des fins de démonstration. Mise à jour :', 'Diretório de prestadores para demonstração. Atualizado em:'],
    ['Consultas, hospitalización, cirugías y procedimientos médicos.', 'Consultations, hospital stays, surgery, and medical procedures.', 'Consultations, hospitalisation, interventions et actes médicaux.', 'Consultas, internações, cirurgias e procedimentos médicos.'],
    ['Odontología, ortodoncia, implantes y tratamientos.', 'Dentistry, orthodontics, implants, and treatments.', 'Soins dentaires, orthodontie, implants et traitements.', 'Odontologia, ortodontia, implantes e tratamentos.'],
    ['Exámenes visuales, lentes y monturas.', 'Eye exams, lenses, and frames.', 'Examens de la vue, verres et montures.', 'Exames de visão, lentes e armações.'],
    ['Proveedor médico / hospital donde se atendió', 'Provider / hospital where care was received', 'Prestataire / hôpital où les soins ont été reçus', 'Prestador / hospital onde foi atendido'],
    ['Este campo aplica solo cuando presenta un hospital, clínica o proveedor.', 'This field applies only when a hospital, clinic, or provider is submitting.', 'Ce champ s’applique uniquement si un hôpital, une clinique ou un prestataire dépose la demande.', 'Este campo se aplica apenas quando um hospital, clínica ou prestador faz o envio.'],
    ['Número de póliza', 'Policy number', 'Numéro de contrat', 'Número da apólice'],
    ['Corredora de seguros', 'Insurance brokerage', 'Cabinet de courtage', 'Corretora de seguros'],
    ['Datos de la solicitud', 'Request details', 'Détails de la demande', 'Dados da solicitação'],
    ['Cambiar a modo claro', 'Switch to light mode', 'Passer au thème clair', 'Mudar para o modo claro'],
    ['Cambiar a modo oscuro', 'Switch to dark mode', 'Passer au thème sombre', 'Mudar para o modo escuro'],
    ['Activar firma de desarrollo', 'Activate developer signature', 'Activer la signature de développement', 'Ativar assinatura de desenvolvimento'],
    ['Visitar gishikoDev en Linktree (abre en una pestaña nueva)', 'Visit gishikoDev on Linktree (opens in a new tab)', 'Visiter gishikoDev sur Linktree (ouvre un nouvel onglet)', 'Visitar gishikoDev no Linktree (abre em uma nova aba)'],
    ['Cambiar idioma: English', 'Switch language: English', 'Changer de langue : English', 'Mudar idioma: English'],
    ['NOVEDADES DOVELA / 01', 'DOVELA HIGHLIGHTS / 01', 'ACTUALITÉS DOVELA / 01', 'NOVIDADES DOVELA / 01'],
    ['NOVEDADES DOVELA / 02', 'DOVELA HIGHLIGHTS / 02', 'ACTUALITÉS DOVELA / 02', 'NOVIDADES DOVELA / 02'],
    ['NOVEDADES DOVELA / 03', 'DOVELA HIGHLIGHTS / 03', 'ACTUALITÉS DOVELA / 03', 'NOVIDADES DOVELA / 03'],
    ['Hospital / Clínica ·', 'Hospital / Clinic ·', 'Hôpital / Clinique ·', 'Hospital / Clínica ·'],
    ['Hospital / clínica que presenta', 'Submitting hospital / clinic', 'Hôpital / clinique déposant la demande', 'Hospital / clínica que envia'],
    ['Indique la cédula.', 'Enter the ID number.', 'Indiquez le numéro de la pièce d’identité.', 'Informe o documento de identidade.'],
    ['Tip:', 'Tip:', 'Conseil :', 'Dica:'],
    ['las condiciones dentro y fuera de la red, como copagos y reembolsos, dependen de su plan. Revíselas en su póliza antes de programar la atención.', 'in-network and out-of-network terms, including copays and reimbursements, depend on your plan. Review your policy before scheduling care.', 'les conditions dans et hors réseau, notamment les tickets modérateurs et remboursements, dépendent de votre contrat. Consultez-le avant de programmer les soins.', 'as condições dentro e fora da rede, como coparticipações e reembolsos, dependem do seu plano. Consulte a apólice antes de agendar o atendimento.'],
    ['{count} archivo(s)', '{count} file(s)', '{count} fichier(s)', '{count} arquivo(s)'],
    ['. ¿Desea usar este idioma en Dovela?', '. Would you like to use it on Dovela?', '. Souhaitez-vous l’utiliser sur Dovela ?', '. Deseja usar esse idioma na Dovela?'],
    ['Ej. María Elena Castillo', 'E.g., Maria Elena Castillo', 'Ex. : Maria Elena Castillo', 'Ex.: Maria Elena Castillo'],
    ['Ej. Hospital General de Valdoria', 'E.g., Valdoria General Hospital', 'Ex. : Hôpital général de Valdoria', 'Ex.: Hospital Geral de Valdoria'],
    ['Ej. Valdoria, Serranova, Dra. Okafor…', 'E.g., Valdoria, Serranova, Dr. Okafor…', 'Ex. : Valdoria, Serranova, Dr Okafor…', 'Ex.: Valdoria, Serranova, Dra. Okafor…'],
    ['Ej. Ortopedia, urgencias', 'E.g., orthopedics, emergency care', 'Ex. : orthopédie, urgences', 'Ex.: ortopedia, pronto atendimento'],
    ['correo@ejemplo.com', 'name@example.com', 'nom@exemple.fr', 'nome@exemplo.com'],
    ['nombre@correo.com', 'name@example.com', 'nom@exemple.fr', 'nome@exemplo.com'],
    ['Cambiar idioma: Français', 'Switch language: French', 'Changer de langue : français', 'Mudar idioma: francês'],
    ['Cambiar idioma: Português', 'Switch language: Portuguese', 'Changer de langue : portugais', 'Mudar idioma: português'],
    ['Cambiar idioma: Español', 'Switch language: Spanish', 'Changer de langue : espagnol', 'Mudar idioma: espanhol'],
    ['8-888-8888 o correo', '8-888-8888 or email', '8-888-8888 ou adresse e-mail', '8-888-8888 ou e-mail'],
    ['con cédula', 'with ID number', 'avec la pièce d’identité', 'com documento de identidade'],
    ['Demo: pruebe', 'Demo: try', 'Démo : essayez', 'Demonstração: teste'],
    ['05 de julio de 2026', 'July 5, 2026', '5 juillet 2026', '5 de julho de 2026'],
    ['URGENTE', 'URGENT', 'URGENT', 'URGENTE'],
    ['Certificación PA', 'Pre-authorization Certificate', 'Attestation d’autorisation préalable', 'Certificado de autorização prévia'],
    ['Imprimir / PDF', 'Print / PDF', 'Imprimer / PDF', 'Imprimir / PDF'],
    ['N.º de certificación:', 'Certificate no.:', 'N° d’attestation :', 'Nº do certificado:'],
    ['Emitido:', 'Issued:', 'Émis le :', 'Emitido em:'],
    ['Certificación de Pre-Autorización', 'Pre-authorization Certificate', 'Attestation d’autorisation préalable', 'Certificado de autorização prévia'],
    ['Hospitalizaciones, cirugías electivas y estudios especiales', 'Hospital stays, elective surgery, and specialized tests', 'Hospitalisations, interventions programmées et examens spécialisés', 'Internações, cirurgias eletivas e exames especializados'],
    ['Colectivo', 'Group plan', 'Contrat collectif', 'Plano empresarial'],
    ['Sexo del paciente', 'Patient sex', 'Sexe du patient', 'Sexo do paciente'],
    ['Relación con el asegurado', 'Relationship to the member', 'Lien avec l’assuré', 'Relação com o segurado'],
    ['Autorización para', 'Authorized for', 'Autorisation pour', 'Autorização para'],
    ['Estadía promedio', 'Expected stay', 'Durée prévue du séjour', 'Permanência prevista'],
    ['Habitación', 'Room', 'Chambre', 'Quarto'],
    ['Diagnóstico(s)', 'Diagnosis / Diagnoses', 'Diagnostic(s)', 'Diagnóstico(s)'],
    ['Procedimientos', 'Procedures', 'Actes', 'Procedimentos'],
    ['Observaciones / Procedimientos especiales:', 'Notes / Special procedures:', 'Observations / Actes particuliers :', 'Observações / Procedimentos especiais:'],
    ['Lugar de atención', 'Place of care', 'Lieu des soins', 'Local do atendimento'],
    ['Médico responsable', 'Responsible physician', 'Médecin responsable', 'Médico responsável'],
    ['Aprobado por', 'Approved by', 'Approuvé par', 'Aprovado por'],
    ['Equipo médico evaluador · Dovela Seguros', 'Medical Review Team · Dovela Insurance', 'Équipe médicale d’évaluation · Dovela Assurances', 'Equipe médica avaliadora · Dovela Seguros'],
    ['Certificación válida hasta', 'Certificate valid through', 'Attestation valable jusqu’au', 'Certificado válido até'],
    ['Firma y sello autorizado', 'Authorized signature and stamp', 'Signature et cachet autorisés', 'Assinatura e carimbo autorizados'],
    ['Documento electrónico generado por el Portal de Autogestión de Dovela Seguros.', 'Electronic document generated by the Dovela Insurance Self-service Portal.', 'Document électronique généré par l’espace en libre-service Dovela Assurances.', 'Documento eletrônico gerado pelo Portal de autoatendimento Dovela Seguros.'],
    ['Dovela Seguros es una entidad ficticia con fines demostrativos; este documento no constituye una autorización ni una cobertura real.', 'Dovela Insurance is a fictional company for demonstration purposes; this document is not an authorization and does not provide actual coverage.', 'Dovela Assurances est une société fictive à des fins de démonstration ; ce document ne constitue ni une autorisation ni une couverture réelle.', 'A Dovela Seguros é uma empresa fictícia para fins de demonstração; este documento não constitui autorização nem cobertura real.'],
    ['Mensaje de Dovela', 'Message from Dovela', 'Message de Dovela', 'Mensagem da Dovela'],
    ['Idioma cambiado a', 'Language changed to', 'Langue sélectionnée :', 'Idioma alterado para'],
    ['Guía rápida · Paso {current} de {total}', 'Quick tour · Step {current} of {total}', 'Visite rapide · Étape {current} sur {total}', 'Guia rápido · Etapa {current} de {total}'],
    ['Le damos la bienvenida a Dovela', 'Welcome to Dovela', 'Bienvenue chez Dovela', 'Boas-vindas à Dovela'],
    ['En menos de un minuto le mostramos cómo resolver sus gestiones en este portal.', 'In less than a minute, we’ll show you how to get things done on this portal.', 'En moins d’une minute, découvrez comment effectuer vos démarches sur ce portail.', 'Em menos de um minuto, mostramos como resolver suas solicitações neste portal.'],
    ['Presente un reclamo', 'Submit a claim', 'Déposez une demande', 'Envie um sinistro'],
    ['Elija «Presentar un reclamo» y complete el formulario guiado. Las preguntas se ajustan según quién presenta.', 'Choose “Submit a claim” and follow the guided form. The questions adapt to who is submitting.', 'Choisissez « Déposer une demande » et suivez le formulaire guidé. Les questions s’adaptent selon la personne qui dépose.', 'Escolha “Enviar um sinistro” e siga o formulário guiado. As perguntas se ajustam a quem está enviando.'],
    ['Siga el estado de su reclamo', 'Track your claim', 'Suivez votre demande', 'Acompanhe seu sinistro'],
    ['Con el código de seguimiento que recibe al presentar, consulte el progreso en «Consultar estado de reclamo».', 'Use the tracking code you receive when you submit to check progress under “Check a claim”.', 'Avec le code de suivi reçu lors du dépôt, consultez l’avancement dans « Suivre une demande ».', 'Com o código de acompanhamento recebido no envio, consulte o andamento em “Consultar um sinistro”.'],
    ['Encuentre atención en la Red Médica', 'Find care in the provider network', 'Trouvez des soins dans le réseau', 'Encontre atendimento na rede credenciada'],
    ['Busque médicos, clínicas y hospitales por especialidad, provincia o nombre. Puede cambiar el idioma y la apariencia desde la barra superior.', 'Search physicians, clinics and hospitals by specialty, province or name. You can change the language and appearance from the top bar.', 'Recherchez médecins, cliniques et hôpitaux par spécialité, province ou nom. Vous pouvez changer la langue et l’apparence depuis la barre supérieure.', 'Busque médicos, clínicas e hospitais por especialidade, província ou nome. Você pode mudar o idioma e a aparência na barra superior.'],
    ['Omitir guía', 'Skip tour', 'Passer la visite', 'Pular guia'],
    ['Anterior', 'Back', 'Précédent', 'Voltar'],
    ['Siguiente', 'Next', 'Suivant', 'Próximo'],
    ['Empezar', 'Get started', 'Commencer', 'Começar'],
    ['¡Todo empieza aquí!', 'Start here!', 'Tout commence ici !', 'Tudo começa aqui!'],
    ['¡Un paso a la vez!', 'One step at a time!', 'Une étape à la fois !', 'Um passo de cada vez!'],
    ['Su código va aquí', 'Your code goes here', 'Votre code ici', 'Seu código vai aqui'],
    ['Filtre y descargue', 'Filter & download', 'Filtrez, téléchargez', 'Filtre e baixe'],
    ['O elija otro idioma:', 'Or choose another language:', 'Ou choisissez une autre langue :', 'Ou escolha outro idioma:']
  ].concat(Array.isArray(window.DovelaI18nExtraRows) ? window.DovelaI18nExtraRows : []);

  const normalizeText = value => String(value || '').replace(/\s+/g, ' ').trim();
  const bySpanish = new Map(rows.map(row => [normalizeText(row[0]), { es: row[0], en: row[1], fr: row[2], pt: row[3] }]));
  const textSources = new WeakMap();
  const textApplied = new WeakMap();
  const attributeSources = new WeakMap();
  let currentLocale = 'es';
  let observer = null;
  let dialogOpener = null;

  function safeStorageGet() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }

  function safeStorageSet(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_) { /* private mode can reject storage */ }
  }

  function normalizeLocale(value) {
    const base = String(value || '').toLowerCase().split(/[-_]/)[0];
    return SUPPORTED.includes(base) ? base : 'es';
  }

  function translate(source, locale, variables) {
    const normalized = normalizeText(source);
    const row = bySpanish.get(normalized);
    let output = row ? (row[locale] || row.es) : source;
    if (variables) Object.keys(variables).forEach(key => { output = output.replaceAll(`{${key}}`, String(variables[key])); });
    return output;
  }

  function preserveWhitespace(source, replacement) {
    const leading = String(source).match(/^\s*/)?.[0] || '';
    const trailing = String(source).match(/\s*$/)?.[0] || '';
    return leading + replacement + trailing;
  }

  function shouldSkipText(node) {
    const parent = node.parentElement;
    return !parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(parent.tagName) || Boolean(parent.closest('[data-i18n-ignore], [contenteditable="true"]'));
  }

  function translateTextNode(node) {
    if (shouldSkipText(node) || !normalizeText(node.data)) return;
    const last = textApplied.get(node);
    if (!textSources.has(node) || (last !== undefined && node.data !== last)) textSources.set(node, node.data);
    const source = textSources.get(node);
    // An <option> without value submits its text; pin the Spanish source so translation never changes stored data.
    const option = node.parentElement;
    if (option.tagName === 'OPTION' && !option.hasAttribute('value')) option.setAttribute('value', normalizeText(source));
    const output = currentLocale === 'es' ? source : preserveWhitespace(source, translate(source, currentLocale));
    node.data = output;
    textApplied.set(node, output);
  }

  function translateAttributes(element) {
    if (!(element instanceof Element) || element.closest('[data-i18n-ignore]')) return;
    const attrs = ['aria-label', 'placeholder', 'title', 'content'];
    let sources = attributeSources.get(element);
    if (!sources) { sources = {}; attributeSources.set(element, sources); }
    attrs.forEach(attr => {
      if (!element.hasAttribute(attr)) return;
      const value = element.getAttribute(attr);
      if (!(attr in sources) || (sources[attr].applied !== undefined && value !== sources[attr].applied)) {
        sources[attr] = { source: value, applied: value };
      }
      const source = sources[attr].source;
      const output = currentLocale === 'es' ? source : translate(source, currentLocale);
      if (output !== value) element.setAttribute(attr, output);
      sources[attr].applied = output;
    });
  }

  function translateTree(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root); return; }
    if (!(root instanceof Element) && root !== document) return;
    if (root instanceof Element) translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
      else translateAttributes(node);
    }
  }

  function announce(message) {
    const region = document.getElementById('i18n-announcer');
    if (!region) return;
    region.textContent = '';
    window.setTimeout(() => { region.textContent = message; }, 30);
  }

  function fitLanguageSelect(select) {
    if (window.matchMedia?.('(max-width: 600px)').matches) {
      select.style.removeProperty('width');
      return;
    }
    const option = select.options[select.selectedIndex];
    if (!option || !document.body) return;
    const computed = window.getComputedStyle(select);
    const measurer = document.createElement('span');
    measurer.textContent = option.textContent.trim();
    Object.assign(measurer.style, {
      position: 'fixed',
      visibility: 'hidden',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      font: computed.font
    });
    document.body.appendChild(measurer);
    const labelWidth = measurer.getBoundingClientRect().width;
    measurer.remove();
    const horizontalPadding = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
    const minimum = parseFloat(computed.minWidth) || 0;
    select.style.width = `${Math.ceil(Math.max(minimum, labelWidth + horizontalPadding + 2))}px`;
  }

  function setLanguage(locale, options) {
    const config = Object.assign({ persist: true, announce: true }, options || {});
    currentLocale = normalizeLocale(locale);
    document.documentElement.lang = LOCALES[currentLocale].tag;
    if (observer) observer.disconnect();
    translateTree(document);
    if (observer) observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'placeholder', 'title', 'content'] });
    document.querySelectorAll('[data-language-select]').forEach(select => {
      select.value = currentLocale;
      fitLanguageSelect(select);
    });
    if (config.persist) safeStorageSet(currentLocale);
    document.dispatchEvent(new CustomEvent('dovela:languagechange', { detail: { locale: currentLocale, tag: LOCALES[currentLocale].tag } }));
    if (config.announce) announce(`${translate('Idioma cambiado a', currentLocale)} ${LOCALES[currentLocale].label}.`);
    return currentLocale;
  }

  function languageFromTimeZone(zone) {
    const value = String(zone || '');
    if (/^(Europe\/Lisbon|Atlantic\/Madeira|America\/Sao_Paulo|America\/Fortaleza|America\/Recife|America\/Bahia|America\/Belem|America\/Manaus|America\/Cuiaba|America\/Porto_Velho|America\/Rio_Branco|America\/Noronha)$/i.test(value)) return 'pt';
    if (/^(Europe\/Paris|Europe\/Brussels|Europe\/Monaco|Indian\/Reunion|America\/Martinique|America\/Guadeloupe|America\/Cayenne)$/i.test(value)) return 'fr';
    if (/^(Europe\/Madrid|Atlantic\/Canary|America\/(Panama|Mexico_City|Bogota|Lima|Santiago|Argentina|Montevideo|Asuncion|Guatemala|Costa_Rica|El_Salvador|Tegucigalpa|Managua|Havana|Santo_Domingo|Caracas|La_Paz|Guayaquil))/i.test(value)) return 'es';
    if (/^(Europe\/London|America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Toronto|Vancouver|Halifax)|Australia\/|Pacific\/Auckland)/i.test(value)) return 'en';
    return null;
  }

  function detectBrowserRecommendation() {
    const languages = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages : [navigator.language];
    const browser = languages.map(value => String(value || '').toLowerCase().split(/[-_]/)[0]).find(locale => SUPPORTED.includes(locale));
    if (browser && browser !== 'es') return { locale: browser, source: 'browser' };
    let zone = '';
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) { /* unsupported Intl */ }
    const regional = languageFromTimeZone(zone);
    return { locale: regional || browser || 'es', source: regional ? 'timezone' : 'browser' };
  }

  function isMobileContext() {
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') return navigator.userAgentData.mobile;
    return matchMedia('(pointer: coarse)').matches && matchMedia('(max-width: 900px)').matches;
  }

  function languageFromCoordinates(latitude, longitude) {
    const inBox = (south, north, west, east) => latitude >= south && latitude <= north && longitude >= west && longitude <= east;
    if (inBox(-34, 6, -74, -34) || inBox(36.7, 42.3, -9.7, -6.0)) return 'pt';
    if (inBox(41, 51.5, -5.5, 9.8) || inBox(44.5, 62.5, -79.9, -56.5) || inBox(2, 6, -55, -51)) return 'fr';
    if (inBox(35.5, 44.5, -10, 4.5) || inBox(-56, 33, -118, -34)) return 'es';
    if (inBox(24, 72, -170, -52) || inBox(49, 61, -11, 2.5) || inBox(-48, -10, 110, 179)) return 'en';
    return null;
  }

  function updateRecommendation(locale) {
    const recommended = document.getElementById('i18n-recommended-language');
    const switchButton = document.getElementById('i18n-switch');
    if (recommended) recommended.textContent = LOCALES[locale].label;
    if (switchButton) {
      switchButton.dataset.locale = locale;
      switchButton.textContent = `${translate('Cambiar idioma', 'es')}: ${LOCALES[locale].label}`;
    }
    // El idioma recomendado ya tiene su botón principal; los chips ofrecen los demás.
    document.querySelectorAll('#i18n-language-dialog .language-chip').forEach(chip => {
      chip.hidden = chip.dataset.locale === locale;
    });
  }

  function closeDialog(persistSpanish) {
    const dialog = document.getElementById('i18n-language-dialog');
    if (!dialog) return;
    if (persistSpanish) setLanguage('es', { persist: true, announce: false });
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
    if (dialogOpener && document.contains(dialogOpener)) dialogOpener.focus();
  }

  function requestDeviceLocation() {
    const button = document.getElementById('i18n-use-location');
    const status = document.getElementById('i18n-location-status');
    if (!button || !status) return;
    if (!navigator.geolocation) {
      status.textContent = translate('No pudimos acceder a su ubicación. Puede elegir un idioma o mantener español.', currentLocale);
      button.hidden = true;
      return;
    }
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    status.textContent = translate('Consultando la ubicación del dispositivo…', currentLocale);
    navigator.geolocation.getCurrentPosition(position => {
      const locale = languageFromCoordinates(position.coords.latitude, position.coords.longitude);
      button.disabled = false;
      button.removeAttribute('aria-busy');
      if (locale && locale !== 'es') {
        updateRecommendation(locale);
        status.textContent = `${translate('La ubicación sugiere', currentLocale)} ${LOCALES[locale].label}.`;
      } else {
        status.textContent = translate('La ubicación no ofrece una recomendación distinta. Puede mantener español o elegir otro idioma.', currentLocale);
      }
    }, () => {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      status.textContent = translate('No pudimos acceder a su ubicación. Puede elegir un idioma o mantener español.', currentLocale);
    }, { enableHighAccuracy: false, maximumAge: 900000, timeout: 8000 });
  }

  function openRecommendationDialog(recommendation) {
    if (!recommendation || recommendation.locale === 'es') return;
    const dialog = document.getElementById('i18n-language-dialog');
    if (!dialog) return;
    updateRecommendation(recommendation.locale);
    const locationButton = document.getElementById('i18n-use-location');
    if (locationButton) locationButton.hidden = !isMobileContext();
    dialogOpener = document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.getElementById('i18n-switch')?.focus();
  }

  function bindControls() {
    document.querySelectorAll('[data-language-select]').forEach(select => {
      select.value = currentLocale;
      fitLanguageSelect(select);
      select.addEventListener('change', event => setLanguage(event.target.value));
    });
    let resizeFrame = 0;
    window.addEventListener('resize', () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        document.querySelectorAll('[data-language-select]').forEach(fitLanguageSelect);
      });
    }, { passive: true });
    document.getElementById('i18n-switch')?.addEventListener('click', event => {
      setLanguage(event.currentTarget.dataset.locale || 'es');
      closeDialog(false);
    });
    document.getElementById('i18n-stay-spanish')?.addEventListener('click', () => closeDialog(true));
    document.querySelectorAll('#i18n-language-dialog .language-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        setLanguage(chip.dataset.locale);
        closeDialog(false);
      });
    });
    document.getElementById('i18n-use-location')?.addEventListener('click', requestDeviceLocation);
    document.getElementById('i18n-language-dialog')?.addEventListener('cancel', event => {
      event.preventDefault();
      closeDialog(true);
    });
  }

  function init() {
    observer = new MutationObserver(mutations => {
      observer.disconnect();
      mutations.forEach(mutation => {
        if (mutation.type === 'characterData') translateTextNode(mutation.target);
        else if (mutation.type === 'attributes') translateAttributes(mutation.target);
        else mutation.addedNodes.forEach(translateTree);
      });
      observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'placeholder', 'title', 'content'] });
    });
    bindControls();
    const requested = new URLSearchParams(window.location.search).get('lang');
    const stored = safeStorageGet();
    const initial = SUPPORTED.includes(requested) ? requested : (SUPPORTED.includes(stored) ? stored : 'es');
    setLanguage(initial, { persist: false, announce: false });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'placeholder', 'title', 'content'] });
    if (!SUPPORTED.includes(requested) && !SUPPORTED.includes(stored)) window.setTimeout(() => openRecommendationDialog(detectBrowserRecommendation()), 450);
  }

  window.DovelaI18n = Object.freeze({
    locales: LOCALES,
    get locale() { return currentLocale; },
    t(source, variables) { return translate(source, currentLocale, variables); },
    has(source) { return bySpanish.has(normalizeText(source)); },
    setLanguage,
    detectBrowserRecommendation,
    languageFromCoordinates,
    formatDate(value, options) { return new Intl.DateTimeFormat(LOCALES[currentLocale].tag, options).format(value); }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
