'use client';

import NeumoCard from '@/components/NeumoCard';
import { withDashboardLayout } from '@/components/layouts/withDashboardLayout';
import { BookOpen } from 'lucide-react';

const ANCHORS = [
  { id: 'demarrage-connexion', label: 'Démarrage & Connexion' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'leads-prospects', label: 'Leads (Prospects)' },
  { id: 'clients', label: 'Clients' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'objectifs-commerciaux', label: 'Objectifs commerciaux' },
  { id: 'statistiques-rapports', label: 'Statistiques & Rapports' },
  { id: 'utilisateurs-parametres', label: 'Utilisateurs & Paramètres' },
  { id: 'recapitulatif-par-role', label: 'Récapitulatif par rôle' },
] as const;

function GuidePageInner() {
  return (
    <div>
      <section className='flex flex-col gap-2'>
        <h1 className='text-xl md:text-2xl font-semibold text-primary flex items-center gap-2'>
          <BookOpen className='w-6 h-6' />
          Guide d&apos;utilisation - IvoireLead CRM
        </h1>
        <p className='text-sm text-gray-500'>
          Retrouvez ici l&apos;essentiel pour utiliser le CRM au quotidien.
        </p>
      </section>

      <NeumoCard className='p-5 bg-linear-to-br from-slate-50 via-white to-indigo-50/40 border border-gray-100 shadow-neu-soft'>
        <p className='text-xs font-semibold text-primary mb-3'>
          Table des matières
        </p>
        <nav className='flex flex-wrap gap-x-4 gap-y-2'>
          {ANCHORS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className='text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded'
            >
              {label}
            </a>
          ))}
        </nav>
      </NeumoCard>

      <section id='demarrage-connexion' className='scroll-mt-4'>
        <NeumoCard className='p-5 bg-white border border-gray-100 shadow-neu-soft'>
          <h2 className='text-sm font-semibold text-primary mb-3'>
            Démarrage & Connexion
          </h2>
          <ul className='text-xs text-gray-700 space-y-2 list-disc pl-5'>
            <li>
              <strong>Connexion :</strong> utilisez votre adresse e-mail et
              votre mot de passe sur la page de connexion.
            </li>
            <li>
              Mot de passe oublié : un lien « Mot de passe oublié » est
              disponible sur l&apos;écran de connexion pour réinitialiser votre
              mot de passe par e-mail.
            </li>
            <li>
              Première utilisation : il est recommandé de modifier votre mot de
              passe après la première connexion (depuis Profil ou Paramètres
              selon la configuration).
            </li>
            <li>
              <strong>Menu principal (sidebar) :</strong> sur ordinateur, la
              barre latérale à gauche affiche les entrées (Dashboard, Agenda,
              Leads, Clients, etc.). Un bouton permet de replier ou déplier le
              menu pour voir les libellés.
            </li>
            <li>
              <strong>Menu mobile :</strong> sur téléphone, un menu horizontal
              en haut de page permet d&apos;accéder aux mêmes sections
              (Dashboard, Agenda, Leads, etc.).
            </li>
          </ul>
        </NeumoCard>
      </section>

      <section id='dashboard' className='scroll-mt-4'>
        <NeumoCard className='p-5 bg-white border border-gray-100 shadow-neu-soft'>
          <h2 className='text-sm font-semibold text-primary mb-3'>Dashboard</h2>
          <p className='text-xs text-gray-700 mb-2'>
            Le tableau de bord affiche une vue d&apos;ensemble de votre
            activité.
          </p>
          <ul className='text-xs text-gray-700 space-y-2 list-disc pl-5'>
            <li>
              <strong>Cartes indicateurs :</strong> Total prospects (nombre de
              leads), Taux de conversion (pourcentage de leads convertis en
              clients), Leads convertis (nombre de clients issus de vos
              prospects).
            </li>
            <li>
              <strong>Prospects récents :</strong> liste des derniers leads avec
              un lien vers la fiche détail.
            </li>
            <li>
              <strong>Pour le commercial :</strong> le bloc « Mon objectif »
              affiche vos objectifs de conversions et de CA pour la période en
              cours, avec des barres de progression.
            </li>
          </ul>
        </NeumoCard>
      </section>

      <section id='leads-prospects' className='scroll-mt-4'>
        <NeumoCard className='p-5 bg-white border border-gray-100 shadow-neu-soft'>
          <h2 className='text-sm font-semibold text-primary mb-3'>
            Leads (Prospects)
          </h2>
          <ul className='text-xs text-gray-700 space-y-2 list-disc pl-5'>
            <li>
              <strong>Liste :</strong> accédez à la liste des leads depuis le
              menu « Leads ». Filtres et vues enregistrées permettent de cibler
              les prospects (par statut, source, commercial, etc.).
            </li>
            <li>
              <strong>Création / modification :</strong> vous pouvez créer un
              nouveau lead ou modifier un lead existant depuis la liste ou la
              fiche détail.
            </li>
            <li>
              <strong>Fiche détail :</strong> en cliquant sur un lead, vous
              ouvrez sa fiche (informations, onglets Activité, Agenda, etc.).
            </li>
            <li>
              <strong>Cycle de vie :</strong> un lead passe par les statuts
              Nouveau → Contacté → Qualifié, puis soit Perdu soit{' '}
              <strong>Converti</strong> en client. La conversion crée un client
              et associe le CA au commercial.
            </li>
            <li>
              <strong>Onglets dans la fiche :</strong> Activité (historique),
              Agenda (tâches liées), et selon les fonctionnalités : suivi des
              emails, appels, rendez-vous.
            </li>
            <li>
              <strong>Import Excel :</strong> depuis la liste des leads, un
              import permet de charger des prospects depuis un fichier Excel.
              Téléchargez d&apos;abord le modèle fourni pour respecter le format
              attendu.
            </li>
            <li>
              <strong>Export :</strong> vous pouvez exporter la liste des leads
              en Excel (filtres appliqués).
            </li>
          </ul>
        </NeumoCard>
      </section>

      <section id='clients' className='scroll-mt-4'>
        <NeumoCard className='p-5 bg-white border border-gray-100 shadow-neu-soft'>
          <h2 className='text-sm font-semibold text-primary mb-3'>Clients</h2>
          <ul className='text-xs text-gray-700 space-y-2 list-disc pl-5'>
            <li>
              <strong>Liste :</strong> la page Clients affiche tous les clients
              de votre société (ou ceux auxquels vous avez accès selon votre
              rôle).
            </li>
            <li>
              <strong>Fiche détail :</strong> informations du client, intérêts
              (produits / services), chiffre d&apos;affaires (CA) total, et
              indication « Converti par » (commercial ayant converti le lead en
              client).
            </li>
            <li>
              <strong>Édition :</strong> les champs client peuvent être modifiés
              depuis la fiche détail.
            </li>
          </ul>
        </NeumoCard>
      </section>

      <section id='agenda' className='scroll-mt-4'>
        <NeumoCard className='p-5 bg-white border border-gray-100 shadow-neu-soft'>
          <h2 className='text-sm font-semibold text-primary mb-3'>Agenda</h2>
          <ul className='text-xs text-gray-700 space-y-2 list-disc pl-5'>
            <li>
              <strong>Vues :</strong> l&apos;agenda propose les vues Jour,
              Semaine, Mois et Année pour visualiser les tâches et rendez-vous.
            </li>
            <li>
              <strong>Visibilité :</strong> un commercial voit uniquement ses
              propres tâches ; un Manager ou Admin voit toutes les tâches de
              l&apos;équipe.
            </li>
            <li>
              <strong>Création :</strong> vous pouvez créer des tâches depuis
              l&apos;agenda. Depuis la fiche d&apos;un lead, il est possible de
              créer une tâche (événement ou rendez-vous) liée à ce prospect. Des
              automatisations peuvent aussi créer des tâches (ex. relance de
              leads inactifs).
            </li>
          </ul>
        </NeumoCard>
      </section>

      <section id='objectifs-commerciaux' className='scroll-mt-4'>
        <NeumoCard className='p-5 bg-white border border-gray-100 shadow-neu-soft'>
          <h2 className='text-sm font-semibold text-primary mb-3'>
            Objectifs commerciaux
          </h2>
          <ul className='text-xs text-gray-700 space-y-2 list-disc pl-5'>
            <li>
              <strong>Où le commercial voit son objectif :</strong> sur le
              Dashboard (bloc « Mon objectif »), sur la page Statistiques
              (section « Mes objectifs ») et éventuellement sur son Profil.
            </li>
            <li>
              <strong>Définition (Manager / Admin) :</strong> depuis la page
              Utilisateurs, une action « Définir objectif » (ou équivalent) sur
              un commercial permet de fixer un objectif : nombre de conversions
              et CA, avec un type de période (Mois, Trimestre, Semestre, Année).
            </li>
            <li>
              <strong>Reconduction :</strong> si un objectif n&apos;a pas été
              atteint en fin de période, le manager ou l&apos;admin peut le
              reconduire pour une nouvelle période depuis la page Statistiques.
            </li>
          </ul>
        </NeumoCard>
      </section>

      <section id='statistiques-rapports' className='scroll-mt-4'>
        <NeumoCard className='p-5 bg-white border border-gray-100 shadow-neu-soft'>
          <h2 className='text-sm font-semibold text-primary mb-3'>
            Statistiques & Rapports
          </h2>
          <ul className='text-xs text-gray-700 space-y-2 list-disc pl-5'>
            <li>
              <strong>Page Statistiques :</strong> accessible aux Managers et
              Admins. Elle affiche les objectifs (définis, réalisés) et les
              indicateurs de l&apos;équipe.
            </li>
            <li>
              <strong>Objectifs en cours par commercial :</strong> cartes
              récapitulatives pour chaque commercial avec objectif de
              conversions et CA, et barres de progression.
            </li>
            <li>
              <strong>Rapport « Résumé des ventes » (Manager / Admin) :</strong>{' '}
              choix de la période (du / au), filtre optionnel par commercial et
              par source. Au clic sur « Générer le rapport », affichage du
              résumé global (Leads, Clients, CA), des tableaux par commercial et
              par source. Bouton « Exporter » pour télécharger le rapport en
              CSV.
            </li>
            <li>
              <strong>Relance automatique :</strong> un bouton permet de lancer
              manuellement la création de tâches de relance pour les leads
              inactifs (selon la configuration).
            </li>
          </ul>
        </NeumoCard>
      </section>

      <section id='utilisateurs-parametres' className='scroll-mt-4'>
        <NeumoCard className='p-5 bg-white border border-gray-100 shadow-neu-soft'>
          <h2 className='text-sm font-semibold text-primary mb-3'>
            Utilisateurs & Paramètres
          </h2>
          <ul className='text-xs text-gray-700 space-y-2 list-disc pl-5'>
            <li>
              <strong>Utilisateurs (réservé Admin / Manager) :</strong> la page
              Utilisateurs permet de gérer les comptes (création, modification,
              rôles). Vous pouvez y définir les objectifs commerciaux pour
              chaque commercial.
            </li>
            <li>
              <strong>Paramètres (réservé Admin / Manager) :</strong> la page
              Paramètres regroupe la gestion de l&apos;organisation (société),
              les données, les CGV, la FAQ ou autres options selon la
              configuration.
            </li>
          </ul>
        </NeumoCard>
      </section>

      <section id='recapitulatif-par-role' className='scroll-mt-4'>
        <NeumoCard className='p-5 bg-white border border-gray-100 shadow-neu-soft'>
          <h2 className='text-sm font-semibold text-primary mb-3'>
            Récapitulatif par rôle
          </h2>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-200'>
                  <th className='text-left py-2 px-3 font-semibold text-gray-700'>
                    Fonctionnalité
                  </th>
                  <th className='text-left py-2 px-3 font-semibold text-gray-700'>
                    Agent (Commercial)
                  </th>
                  <th className='text-left py-2 px-3 font-semibold text-gray-700'>
                    Manager
                  </th>
                  <th className='text-left py-2 px-3 font-semibold text-gray-700'>
                    Admin
                  </th>
                </tr>
              </thead>
              <tbody className='text-gray-700'>
                <tr className='border-b border-gray-100'>
                  <td className='py-2 px-3'>
                    Dashboard, Leads, Clients, Agenda
                  </td>
                  <td className='py-2 px-3'>
                    Voir / éditer ses leads et clients, son agenda
                  </td>
                  <td className='py-2 px-3'>Idem + voir toute l&apos;équipe</td>
                  <td className='py-2 px-3'>Idem</td>
                </tr>
                <tr className='border-b border-gray-100'>
                  <td className='py-2 px-3'>Objectif commercial</td>
                  <td className='py-2 px-3'>
                    Voir son objectif (Dashboard, Stats, Profil)
                  </td>
                  <td className='py-2 px-3'>
                    Définir et reconduire les objectifs
                  </td>
                  <td className='py-2 px-3'>Idem</td>
                </tr>
                <tr className='border-b border-gray-100'>
                  <td className='py-2 px-3'>Statistiques & Rapports</td>
                  <td className='py-2 px-3'>Vue limitée (mes objectifs)</td>
                  <td className='py-2 px-3'>
                    Rapports, export CSV, objectifs équipe
                  </td>
                  <td className='py-2 px-3'>Idem</td>
                </tr>
                <tr className='border-b border-gray-100'>
                  <td className='py-2 px-3'>Utilisateurs</td>
                  <td className='py-2 px-3'>—</td>
                  <td className='py-2 px-3'>Gestion des utilisateurs, rôles</td>
                  <td className='py-2 px-3'>Idem</td>
                </tr>
                <tr className='border-b border-gray-100'>
                  <td className='py-2 px-3'>Paramètres</td>
                  <td className='py-2 px-3'>—</td>
                  <td className='py-2 px-3'>
                    Organisation, données, CGV / FAQ
                  </td>
                  <td className='py-2 px-3'>Idem</td>
                </tr>
              </tbody>
            </table>
          </div>
        </NeumoCard>
      </section>

      <p className='text-[11px] text-gray-400 mt-4'>
        Pour toute question, contactez votre administrateur ou le support
        IvoireLead CRM.
      </p>
    </div>
  );
}

const GuidePage = withDashboardLayout(GuidePageInner);
export default GuidePage;
