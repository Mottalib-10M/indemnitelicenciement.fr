/**
 * Ce que chaque anciennete change (RECETTE §6).
 *
 * Les sept pages par anciennete partageaient 89 % de leur texte : seuls les
 * chiffres variaient, et check-unique les neutralise avant de comparer. Chacune
 * porte donc ici deux sections qui ne valent que pour elle, choisies sur ce que
 * l'anciennete change reellement : le seuil d'ouverture du droit, la charniere du
 * bareme a dix ans, les plafonds d'exoneration, la duree du preavis
 * conventionnel. Rien n'y est transposable d'une page a l'autre.
 */
export interface Angle {
  titre: string;
  paragraphes: string[];
}

export const ANGLES: Record<number, Angle[]> = {
  1: [
    {
      titre: "Le seuil de huit mois, et ce qui se passe juste avant",
      paragraphes: [
        "Le droit à l'indemnité légale s'ouvre à huit mois d'ancienneté ininterrompue, pas à un an : un salarié licencié à sept mois et demi n'y a droit à aucun titre, et un salarié licencié à huit mois et un jour y a droit intégralement. Ce seuil, fixé par l'article L1234-9 du Code du travail, se compte jusqu'à la date d'envoi de la lettre de licenciement, et non jusqu'à la fin du préavis. Une convention collective peut abaisser ce seuil, plusieurs branches ouvrant le droit dès six mois, et c'est alors elle qui s'applique.",
        "La période d'essai ne réduit pas l'ancienneté : elle en fait partie, et son éventuel renouvellement aussi. Un contrat à durée déterminée transformé en contrat à durée indéterminée conserve l'ancienneté acquise pendant le contrat initial, de même qu'un contrat repris par un nouvel employeur dans le cadre d'un transfert d'entreprise. En revanche, une démission suivie d'une réembauche rompt le compteur, même si l'interruption n'a duré que quelques jours.",
      ],
    },
    {
      titre: "Pourquoi le préavis pèse plus que l'indemnité à ce stade",
      paragraphes: [
        "Avec une seule année d'ancienneté, l'indemnité légale représente un quart de mois de salaire, tandis que le préavis est d'un mois entier. Si l'employeur dispense le salarié de l'exécuter, l'indemnité compensatrice de préavis vaut donc quatre fois l'indemnité de licenciement. Cette proportion s'inverse progressivement avec l'ancienneté, et elle explique une confusion fréquente dans la lecture d'un solde de tout compte : la ligne la plus élevée n'est pas l'indemnité de licenciement.",
        "Les deux sommes n'ont ni la même nature ni le même traitement fiscal. L'indemnité de licenciement est une réparation, exonérée d'impôt et de cotisations dans sa part légale. L'indemnité compensatrice de préavis remplace un salaire : elle est imposable, soumise à cotisations, et elle génère des congés payés. Vérifier que le bulletin les distingue est le premier contrôle à faire, car un montant global agrégé rend le calcul invérifiable et masque parfois l'absence de l'une des deux.",
      ],
    },
    {
      titre:
        "Le cas du contrat à durée déterminée et de l'essai",
      paragraphes: [
        "Un contrat à durée déterminée arrivé à son terme ne donne pas lieu à une indemnité de licenciement mais à une prime de précarité, égale à dix pour cent de la rémunération brute totale versée, sauf lorsque le contrat se poursuit en contrat à durée indéterminée ou lorsqu'il s'agit d'un contrat saisonnier, d'usage ou d'un contrat conclu avec un étudiant pendant ses vacances.",
        "Une rupture pendant la période d'essai ne relève pas non plus du licenciement : elle n'exige aucun motif, ne donne droit à aucune indemnité, et suppose seulement le respect d'un délai de prévenance de vingt-quatre heures à un mois selon la durée de présence. Passée l'échéance de l'essai, même d'un jour, la rupture redevient un licenciement avec sa procédure complète, entretien préalable compris, et c'est cette date qui mérite d'être vérifiée avant toute autre chose.",
      ],
    },
  ],
  5: [
    {
      titre: "Cinq ans, entièrement dans la première tranche du barème",
      paragraphes: [
        "À cinq ans, le calcul n'utilise qu'une seule tranche : un quart de mois de salaire de référence par année, sans majoration. Le taux d'un tiers de mois ne concerne que les années au-delà de la dixième, si bien que rien ne distingue, dans la méthode, une ancienneté de cinq ans d'une ancienneté de trois ou de neuf. Ce qui change le résultat à ce stade n'est donc pas le barème mais le salaire de référence, et c'est là que se joue l'essentiel des désaccords.",
        "Le salaire de référence est le plus favorable de deux moyennes : celle des douze derniers mois précédant la notification, ou celle des trois derniers mois. Dans la moyenne sur trois mois, les primes annuelles et le treizième mois ne comptent qu'au prorata de trois douzièmes, ce qui évite de gonfler artificiellement la base quand la prime tombe dans la période. Les mois d'arrêt maladie sont reconstitués au salaire qu'aurait perçu le salarié, et non au montant des indemnités journalières.",
      ],
    },
    {
      titre: "Le passage du préavis à deux mois",
      paragraphes: [
        "Au-delà de deux ans d'ancienneté, le préavis légal passe d'un mois à deux. À cinq ans, il est donc de deux mois, et la convention collective peut l'allonger, généralement à trois mois pour les cadres. C'est le préavis conventionnel qui s'applique s'il est plus long, l'inverse n'étant pas possible. Une dispense donne lieu à une indemnité compensatrice égale au salaire de la période entière, y compris les primes qui auraient été versées.",
        "Le préavis, exécuté ou non, ne modifie pas la date de fin du contrat, et celle-ci reste la référence pour le solde de tout compte, l'attestation destinée à France Travail et le point de départ du délai de contestation. Un salarié dispensé de préavis cesse de travailler mais reste salarié jusqu'au terme : il continue d'acquérir des congés payés, et il conserve sa couverture de prévoyance jusqu'à cette date.",
      ],
    },
    {
      titre:
        "Les congés payés dans le solde de tout compte",
      paragraphes: [
        "Les jours de congés acquis et non pris se paient en indemnité compensatrice de congés payés, calculée au plus favorable entre la règle du dixième de la rémunération de la période de référence et la règle du maintien de salaire. Cette somme est imposable et soumise à cotisations, contrairement à l'indemnité de licenciement, et elle apparaît sur une ligne distincte du solde de tout compte.",
        "Trois points reviennent souvent. Les congés acquis pendant le préavis, exécuté ou non, s'ajoutent au décompte. Les jours de réduction du temps de travail suivent un régime propre fixé par l'accord d'entreprise, et certains accords prévoient leur perte à la rupture. Enfin les congés acquis au titre de l'année en cours et non encore ouverts se paient aussi : la jurisprudence n'impose pas d'attendre l'ouverture de la période de prise pour les indemniser.",
      ],
    },
  ],
  10: [
    {
      titre: "La charnière : ce que change la onzième année",
      paragraphes: [
        "Dix ans est la dernière année calculée intégralement au quart de mois. À partir de la onzième, chaque année supplémentaire compte pour un tiers de mois, soit un tiers de plus par année. Le barème n'est donc pas linéaire, et une notification décalée de quelques semaines peut faire franchir la limite : entre dix ans et onze mois d'ancienneté et onze ans révolus, la différence porte sur un tiers de mois de salaire, auquel s'ajoute le prorata des mois entamés.",
        "Le prorata compte précisément à cet endroit. Les mois entamés au-delà d'une année complète donnent droit à une fraction d'indemnité au douzième du taux applicable. Une ancienneté de dix ans et huit mois vaut donc dix années au quart de mois, plus huit douzièmes d'un quart de mois. L'administration et la jurisprudence retiennent l'ancienneté à la date de rupture, c'est-à-dire à la fin du préavis même lorsque celui-ci n'est pas exécuté, ce qui peut suffire à atteindre la tranche suivante.",
      ],
    },
    {
      titre: "Le moment où la convention collective devient décisive",
      paragraphes: [
        "C'est à partir de dix ans que les barèmes de branche s'écartent nettement du minimum légal. Plusieurs conventions prévoient un demi-mois par année au-delà de dix ans, certaines un mois entier pour les cadres, généralement sous un plafond exprimé en mois de salaire. L'employeur doit appliquer le régime le plus favorable pris dans son ensemble, et non additionner les deux barèmes ni composer le meilleur de chacun ligne à ligne.",
        "Identifier la convention applicable est donc un préalable au calcul, et cette convention est celle de l'activité principale de l'entreprise, mentionnée sur le bulletin de paie avec son identifiant. Un bulletin qui ne la mentionne pas, ou qui mentionne une convention ne correspondant pas à l'activité réelle, est un point à soulever : la jurisprudence retient la convention correspondant à l'activité effective, quelle que soit la mention portée sur le bulletin.",
      ],
    },
    {
      titre:
        "Ce qui reste acquis après le départ",
      paragraphes: [
        "Trois droits survivent à la rupture et ne dépendent pas du motif du licenciement. Le compte personnel de formation conserve les euros crédités, mobilisables sans accord d'un employeur, y compris pendant une période de chômage. La complémentaire santé et la prévoyance se poursuivent gratuitement au titre de la portabilité, pour une durée égale à celle du dernier contrat, dans la limite de douze mois, à condition d'être indemnisé par l'assurance chômage.",
        "L'épargne salariale, intéressement, participation et plan d'épargne entreprise, reste disponible : les sommes peuvent être débloquées à l'occasion de la rupture ou transférées sur un autre plan, et la rupture du contrat constitue précisément un cas de déblocage anticipé. Il faut en revanche demander expressément le transfert, faute de quoi les frais de tenue de compte, jusqu'alors supportés par l'employeur, passent à la charge de l'ancien salarié.",
      ],
    },
  ],
  15: [
    {
      titre: "Un calcul en deux tranches, et l'erreur fréquente",
      paragraphes: [
        "À quinze ans, le calcul additionne deux tranches et non une seule appliquée à l'ensemble : un quart de mois par année pour les dix premières, puis un tiers de mois par année pour les cinq suivantes. L'erreur la plus fréquente consiste à appliquer le taux d'un tiers à la totalité de l'ancienneté, ce qui surévalue le montant de près d'un mois de salaire. L'erreur inverse, appliquer le quart à tout, le sous-évalue d'autant.",
        "Le résultat se vérifie donc en deux lignes distinctes, et un solde de tout compte qui n'affiche qu'un montant global ne permet pas ce contrôle. Demander le détail du calcul n'est pas une formalité : l'employeur doit pouvoir justifier le salaire de référence retenu et l'ancienneté comptée, et un désaccord sur l'une de ces deux données se règle plus facilement avant la signature du reçu pour solde de tout compte qu'après.",
      ],
    },
    {
      titre: "Le seuil où la fiscalité de la part négociée commence à compter",
      paragraphes: [
        "À quinze ans, l'indemnité légale approche quatre mois de salaire, et une indemnité négociée au-delà devient significative. Cette part supra-légale n'est exonérée d'impôt sur le revenu que dans la limite du plus élevé de trois plafonds : deux fois la rémunération annuelle brute de l'année civile précédente, la moitié de l'indemnité totale, ou six fois le plafond annuel de la Sécurité sociale. Le plafond retenu est celui qui vous est le plus favorable, sans démarche à accomplir.",
        "Les cotisations sociales suivent une règle plus stricte, avec une exonération limitée à deux fois le plafond annuel de la Sécurité sociale, et la CSG-CRDS s'applique dès le premier euro versé au-delà du montant légal. Une indemnité transactionnelle conclue après la rupture suit le même régime, à condition que son objet soit bien la réparation d'un préjudice et non le paiement d'un salaire ou d'un préavis déguisé.",
      ],
    },
    {
      titre:
        "L'articulation avec l'allocation chômage",
      paragraphes: [
        "Le montant négocié au-delà du minimum légal retarde le premier versement de l'allocation d'aide au retour à l'emploi. France Travail applique un différé spécifique d'indemnisation, égal à la part supra-légale divisée par un coefficient fixé par la convention d'assurance chômage, plafonné à cent cinquante jours. Ce différé s'ajoute au différé de congés payés, lui-même égal au nombre de jours indemnisés, puis au délai d'attente de sept jours.",
        "L'arbitrage se calcule donc en jours : une indemnité supra-légale de dix mille euros peut reporter l'allocation de plusieurs semaines, ce qui neutralise une partie du gain. Le différé ne s'applique pas à la part correspondant à l'indemnité légale ou conventionnelle obligatoire, ni aux dommages et intérêts prononcés par un juge pour licenciement sans cause réelle et sérieuse : la qualification exacte des sommes dans le protocole a donc des conséquences directes sur la trésorerie des premiers mois.",
      ],
    },
  ],
  20: [
    {
      titre: "Vingt ans : le plafond de cotisations devient le sujet",
      paragraphes: [
        "À vingt ans, l'indemnité légale atteint près de six mois de salaire de référence, et une indemnité négociée franchit facilement le plafond d'exonération de cotisations sociales, fixé à deux fois le plafond annuel de la Sécurité sociale pour l'ensemble des indemnités de rupture versées. Au-delà de ce seuil, la fraction excédentaire est soumise aux cotisations comme un salaire, ce qui réduit sensiblement le montant net perçu par rapport au montant annoncé en brut dans une négociation.",
        "Il existe un second seuil, moins connu : lorsque l'indemnité totale dépasse dix fois le plafond annuel de la Sécurité sociale, elle est soumise aux cotisations sur son intégralité, y compris la part légale normalement exonérée. Ce mécanisme dit de rupture du plafond concerne les rémunérations élevées et rend nécessaire un calcul en net avant d'arrêter un montant, l'écart entre brut et net pouvant dépasser le quart de la somme négociée.",
      ],
    },
    {
      titre: "Ce que vingt ans d'ancienneté ouvrent par ailleurs",
      paragraphes: [
        "Une ancienneté longue déclenche des droits qui ne relèvent pas du calcul de l'indemnité. Le barème d'indemnisation du licenciement sans cause réelle et sérieuse, fixé à l'article L1235-3, progresse avec l'ancienneté et atteint à vingt ans un maximum de vingt mois de salaire brut, contre trois mois à deux ans d'ancienneté. Ce barème encadre ce que le conseil de prud'hommes peut accorder, et il constitue donc la borne réelle d'une négociation menée sous la menace d'un contentieux.",
        "La portabilité de la prévoyance et de la complémentaire santé, elle, ne dépend pas de l'ancienneté mais de la durée du dernier contrat, dans la limite de douze mois. Le compte personnel de formation reste acquis sans condition. Enfin, une ancienneté de vingt ans dans une entreprise d'au moins onze salariés ouvre droit, en cas de licenciement économique, à des mesures d'accompagnement renforcées dont le contenu figure dans le plan de sauvegarde de l'emploi lorsqu'il en existe un.",
      ],
    },
    {
      titre:
        "Le contrat de sécurisation professionnelle",
      paragraphes: [
        "Dans une entreprise de moins de mille salariés, un licenciement économique ouvre la proposition d'un contrat de sécurisation professionnelle, à accepter ou refuser dans un délai de vingt et un jours. Accepté, il supprime le préavis et l'indemnité compensatrice correspondante, mais il ouvre une allocation de sécurisation professionnelle supérieure à l'allocation de droit commun, pendant douze mois, assortie d'un accompagnement renforcé et d'un accès facilité à la formation.",
        "Le calcul mérite d'être fait avant de répondre, car il dépend du niveau de salaire et de la durée prévisible de recherche. L'indemnité de licenciement, elle, reste due dans les deux cas et n'est pas affectée par le choix. Un refus ramène au régime de droit commun avec préavis exécuté ou indemnisé. Le silence à l'expiration du délai vaut refus, ce qui fait de cette échéance l'une des rares dont l'oubli est irréversible.",
      ],
    },
  ],
  25: [
    {
      titre: "Vérifier le salaire de référence avant tout le reste",
      paragraphes: [
        "À vingt-cinq ans d'ancienneté, l'indemnité légale approche sept mois et demi de salaire : une erreur de cent euros sur le salaire de référence se traduit par plus de sept cents euros sur le montant final. C'est la raison pour laquelle la vérification de cette base passe avant celle du barème. Trois éléments s'y intègrent souvent à tort ou à raison : le treizième mois, au prorata dans la moyenne sur trois mois, les primes d'objectifs, pour leur part effectivement versée, et les heures supplémentaires régulières.",
        "Trois éléments en revanche n'entrent pas dans la base : les remboursements de frais professionnels, les primes exceptionnelles non liées au travail, et l'intéressement ou la participation, qui ne sont pas du salaire. Les périodes d'activité partielle sont reconstituées au salaire habituel. En cas de passage à temps partiel en fin de carrière, la jurisprudence retient une base proratisée selon les périodes travaillées à temps plein et à temps partiel, et non le seul dernier salaire réduit.",
      ],
    },
    {
      titre: "Le préavis conventionnel des cadres",
      paragraphes: [
        "Le préavis légal reste de deux mois quelle que soit l'ancienneté au-delà de deux ans, mais les conventions collectives l'allongent presque systématiquement pour les cadres, généralement à trois mois, parfois six pour les cadres dirigeants. À vingt-cinq ans d'ancienneté, la quasi-totalité des salariés concernés relèvent d'un préavis conventionnel plus long que le minimum légal, et l'indemnité compensatrice due en cas de dispense se calcule sur cette durée conventionnelle.",
        "Le préavis peut être écourté à la demande du salarié, par exemple pour rejoindre un nouvel employeur, mais l'employeur n'est alors pas tenu de verser l'indemnité compensatrice pour la période non exécutée : la dispense à l'initiative du salarié n'ouvre pas les mêmes droits que la dispense décidée par l'employeur. Cette distinction se formalise par écrit, et son absence est une source fréquente de contentieux sur le montant du solde de tout compte.",
      ],
    },
    {
      titre:
        "Retraite, trimestres et fin de carrière",
      paragraphes: [
        "Un licenciement en fin de carrière soulève trois questions qui n'ont rien à voir avec le calcul de l'indemnité. Les périodes indemnisées par l'assurance chômage valident des trimestres de retraite, à raison d'un trimestre par cinquante jours indemnisés, dans la limite de quatre par an, ce qui évite le plus souvent une rupture dans la carrière. L'allocation elle-même peut être maintenue jusqu'à l'âge du taux plein sous conditions d'âge et de durée d'affiliation.",
        "La mise à la retraite d'office par l'employeur n'est possible qu'à partir de soixante-dix ans ; avant cet âge, elle suppose l'accord du salarié et ouvre droit à une indemnité de mise à la retraite au moins égale à l'indemnité légale de licenciement. À ne pas confondre avec le départ volontaire à la retraite, qui relève d'un barème conventionnel généralement moins favorable et ne donne pas droit à l'allocation chômage.",
      ],
    },
  ],
  30: [
    {
      titre: "Trente ans : le plafond conventionnel devient la limite réelle",
      paragraphes: [
        "À trente ans d'ancienneté, l'indemnité légale dépasse neuf mois de salaire de référence, et c'est le plafond prévu par la convention collective qui devient déterminant. La plupart des barèmes de branche plus généreux que la loi sont assortis d'un plafond exprimé en mois, souvent douze, quinze ou dix-huit, atteint précisément autour de vingt-cinq à trente-cinq ans d'ancienneté. Au-delà de ce plafond, les années supplémentaires n'augmentent plus l'indemnité conventionnelle, alors qu'elles continuent d'augmenter l'indemnité légale.",
        "Il faut donc recalculer les deux montants, car le plus favorable peut changer à partir d'un certain point : une convention plafonnée à douze mois est plus favorable que la loi jusqu'à une certaine ancienneté, puis cesse de l'être. Le calcul se refait à la date de notification, sur la dernière version de la convention, les plafonds étant régulièrement renégociés et certains accords prévoyant des majorations liées à l'âge du salarié au moment de la rupture.",
      ],
    },
    {
      titre: "Ce qu'une carrière longue change à la négociation",
      paragraphes: [
        "Une ancienneté de trente ans place le barème d'indemnisation d'un licenciement sans cause réelle et sérieuse à son maximum, vingt mois de salaire brut, ce qui fixe la borne supérieure de ce qu'un conseil de prud'hommes peut accorder au-delà de l'indemnité de rupture. Cette borne encadre la négociation dans les deux sens : elle donne une référence chiffrée au salarié, et elle donne à l'employeur une limite au risque qu'il encourt.",
        "Deux vérifications restent propres aux carrières longues. La première porte sur la continuité de l'ancienneté à travers les changements de structure, fusions, cessions d'activité ou transferts de contrat, chacun conservant l'ancienneté acquise à condition que le contrat ait été transféré et non rompu. La seconde porte sur les périodes atypiques, congé parental compté pour moitié, congé sabbatique non compté, mandat syndical compté intégralement : sur trente ans, leur cumul représente parfois plus d'une année d'ancienneté contestée.",
      ],
    },
    {
      titre:
        "Départ à la retraite ou licenciement : deux régimes",
      paragraphes: [
        "Sur une carrière de trente ans, la rupture intervient parfois à un âge où plusieurs voies coexistent, et leurs conséquences financières diffèrent nettement. Un licenciement ouvre l'indemnité légale ou conventionnelle et l'allocation chômage. Une mise à la retraite à l'initiative de l'employeur ouvre une indemnité au moins égale à l'indemnité légale de licenciement, exonérée dans les mêmes limites, mais pas l'allocation chômage. Un départ volontaire ouvre une indemnité de départ souvent plus faible et aucune allocation.",
        "La qualification retenue dans les documents de fin de contrat n'est pas négociable à la convenance des parties : elle découle des faits et de l'âge du salarié, et une requalification devant le conseil de prud'hommes est possible dans le délai de douze mois. C'est aussi ce qui explique l'attention portée au libellé de l'attestation destinée à France Travail, dont dépend l'ouverture même des droits à indemnisation.",
      ],
    },
  ],
};
