# API Dashboard Association - Documentation

## Vue d'ensemble

Cette API fournit des endpoints pour récupérer des statistiques et métriques détaillées sur les activités des associations. Elle permet aux associations d'avoir une vue d'ensemble complète de leurs performances.

## Endpoints disponibles

### Base URL
```
/association-dashboard
```

### 1. Dashboard complet
**GET** `/:associationId`

Récupère toutes les statistiques et métriques pour le dashboard d'une association.

**Paramètres de requête :**
- `startDate` (optionnel) : Date de début pour le filtrage (format ISO)
- `endDate` (optionnel) : Date de fin pour le filtrage (format ISO)
- `eventType` (optionnel) : Type d'événement à filtrer
- `status` (optionnel) : Statut des annonces à inclure

**Exemple de requête :**
```
GET /association-dashboard/123456?startDate=2024-01-01&endDate=2024-12-31&eventType=collecte
```

**Réponse :**
```json
{
  "announcementStats": {
    "totalAnnouncements": 15,
    "activeAnnouncements": 8,
    "completedAnnouncements": 6,
    "cancelledAnnouncements": 1,
    "completionRate": 40,
    "averageParticipantsPerAnnouncement": 12.5,
    "averageVolunteersPerAnnouncement": 8.2
  },
  "participantStats": {
    "totalUniqueParticipants": 45,
    "totalParticipations": 187,
    "newParticipantsThisMonth": 12,
    "retentionRate": 65,
    "mostActiveParticipant": {
      "id": "user123",
      "name": "Jean Dupont",
      "participations": 8
    }
  },
  "volunteerStats": {
    "totalUniqueVolunteers": 23,
    "totalVolunteerParticipations": 123,
    "newVolunteersThisMonth": 5,
    "retentionRate": 78,
    "mostActiveVolunteer": {
      "id": "vol123",
      "name": "Marie Martin",
      "participations": 12
    },
    "volunteersInWaitingList": 3
  },
  "engagementStats": {
    "overallEngagementRate": 15.2,
    "averageEventFillRate": 75,
    "mostPopularEvent": {
      "id": "event123",
      "name": "Collecte de dons",
      "participants": 25,
      "volunteers": 8
    },
    "bestFillRateEvent": {
      "id": "event456",
      "name": "Formation bénévoles",
      "fillRate": 95
    }
  },
  "timeSeriesData": [
    {
      "date": "2024-01-01",
      "announcements": 2,
      "participants": 15,
      "volunteers": 8,
      "engagementRate": 11.5
    }
  ],
  "eventTypeStats": [
    {
      "eventType": "collecte",
      "count": 8,
      "completionRate": 75,
      "averageParticipants": 18
    }
  ],
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z"
  }
}
```

### 2. Statistiques des annonces
**GET** `/:associationId/announcements`

Récupère uniquement les statistiques des annonces.

### 3. Statistiques des participants
**GET** `/:associationId/participants`

Récupère uniquement les statistiques des participants.

### 4. Statistiques des bénévoles
**GET** `/:associationId/volunteers`

Récupère uniquement les statistiques des bénévoles.

### 5. Statistiques d'engagement
**GET** `/:associationId/engagement`

Récupère uniquement les statistiques d'engagement.

### 6. Données temporelles
**GET** `/:associationId/timeline`

Récupère les données chronologiques pour les graphiques temporels.

### 7. Statistiques par type d'événement
**GET** `/:associationId/event-types`

Récupère les métriques détaillées par type d'événement.

## Authentification

Tous les endpoints nécessitent une authentification avec un token Bearer et les rôles suivants :
- `ASSOCIATION` : Pour accéder aux données de sa propre association
- `ADMIN` : Pour accéder aux données de toutes les associations

## Codes de réponse

- `200` : Succès
- `401` : Non autorisé
- `403` : Accès interdit
- `404` : Association non trouvée
- `500` : Erreur interne du serveur

## Métriques calculées

### Statistiques des annonces
- **totalAnnouncements** : Nombre total d'annonces
- **activeAnnouncements** : Nombre d'annonces actives
- **completedAnnouncements** : Nombre d'annonces terminées
- **cancelledAnnouncements** : Nombre d'annonces annulées
- **completionRate** : Taux de complétion des annonces (%)
- **averageParticipantsPerAnnouncement** : Moyenne des participants par annonce
- **averageVolunteersPerAnnouncement** : Moyenne des bénévoles par annonce

### Statistiques des participants
- **totalUniqueParticipants** : Nombre total de participants uniques
- **totalParticipations** : Nombre total de participations
- **newParticipantsThisMonth** : Nombre de nouveaux participants ce mois
- **retentionRate** : Taux de rétention des participants (%)
- **mostActiveParticipant** : Participant le plus actif

### Statistiques des bénévoles
- **totalUniqueVolunteers** : Nombre total de bénévoles uniques
- **totalVolunteerParticipations** : Nombre total de participations bénévoles
- **newVolunteersThisMonth** : Nombre de nouveaux bénévoles ce mois
- **retentionRate** : Taux de rétention des bénévoles (%)
- **mostActiveVolunteer** : Bénévole le plus actif
- **volunteersInWaitingList** : Nombre de bénévoles en liste d'attente

### Statistiques d'engagement
- **overallEngagementRate** : Taux d'engagement global
- **averageEventFillRate** : Taux de remplissage moyen des événements (%)
- **mostPopularEvent** : Événement le plus populaire
- **bestFillRateEvent** : Événement avec le meilleur taux de remplissage

## Filtres disponibles

### Période
- `startDate` : Date de début (format ISO)
- `endDate` : Date de fin (format ISO)

### Type d'événement
- `eventType` : Filtre par type d'événement (ex: "collecte", "formation", etc.)

### Statut
- `status` : Filtre par statut d'annonce (ACTIVE, COMPLETED, INACTIVE)

## Exemples d'utilisation

### Récupérer le dashboard complet pour les 6 derniers mois
```
GET /association-dashboard/123456
```

### Récupérer les statistiques d'engagement pour une période spécifique
```
GET /association-dashboard/123456/engagement?startDate=2024-06-01&endDate=2024-06-30
```

### Récupérer les statistiques par type d'événement
```
GET /association-dashboard/123456/event-types?eventType=collecte
```

## Performance

- Les calculs sont effectués en mémoire pour de meilleures performances
- Les données sont filtrées côté serveur pour réduire le trafic réseau
- Les métriques sont calculées à la demande pour garantir la fraîcheur des données

## Évolutions futures

- Ajout de métriques de tendances (évolution sur le temps)
- Intégration de recommandations d'amélioration
- Export des données en CSV/Excel
- Notifications automatiques basées sur les métriques
- Comparaison avec d'autres associations (anonymisée)
