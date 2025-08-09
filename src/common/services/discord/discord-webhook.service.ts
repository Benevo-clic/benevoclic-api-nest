import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

export interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  thumbnail?: DiscordEmbedThumbnail;
  footer?: DiscordEmbedFooter;
  timestamp?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedThumbnail {
  url: string;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

@Injectable()
export class DiscordWebhookService {
  private readonly logger = new Logger(DiscordWebhookService.name);
  private readonly webhookUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>('WEBHOOK_SUPPORT_URL');
  }

  /**
   * Envoie une notification Discord pour un nouveau ticket de support
   */
  async sendSupportTicketNotification(report: any): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.warn('Discord webhook URL not configured, skipping notification');
      return;
    }

    try {
      const embed = this.createSupportTicketEmbed(report);
      const payload: DiscordWebhookPayload = {
        embeds: [embed],
        username: 'Benevoclic Support Bot',
        avatar_url: 'https://cdn.discordapp.com/emojis/🆘.png',
      };

      await this.sendWebhook(payload);
      this.logger.log(`Discord notification sent for support ticket: ${report.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send Discord notification for support ticket: ${report.id}`,
        error.stack,
      );
    }
  }

  /**
   * Envoie une notification Discord pour un changement de statut de ticket
   */
  async sendStatusUpdateNotification(
    report: any,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.warn('Discord webhook URL not configured, skipping notification');
      return;
    }

    try {
      const embed = this.createStatusUpdateEmbed(report, oldStatus, newStatus);
      const payload: DiscordWebhookPayload = {
        embeds: [embed],
        username: 'Benevoclic Support Bot',
        avatar_url: 'https://cdn.discordapp.com/emojis/📊.png',
      };

      await this.sendWebhook(payload);
      this.logger.log(`Discord status update notification sent for ticket: ${report.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send Discord status update notification for ticket: ${report.id}`,
        error.stack,
      );
    }
  }

  /**
   * Crée un embed pour un nouveau ticket de support
   */
  private createSupportTicketEmbed(report: any): DiscordEmbed {
    const color = this.getColorForReportType(report.type);
    const emoji = this.getEmojiForReportType(report.type);
    const categoryLabel = this.getCategoryLabel(report.category);

    return {
      title: `${emoji} Nouveau ticket de support #${report.id}`,
      description: `**Type:** ${this.getTypeLabel(report.type)}\n**Catégorie:** ${categoryLabel}\n\n**Description:**\n${report.description}`,
      color: color,
      fields: [
        {
          name: '📅 Date de création',
          value: new Date(report.createdAt).toLocaleString('fr-FR'),
          inline: true,
        },
        {
          name: '👤 Utilisateur',
          value: report.userEmail || 'Anonyme',
          inline: true,
        },
        {
          name: '🔗 URL de la page',
          value: report.pageUrl || 'Non spécifiée',
          inline: false,
        },
      ],
      footer: {
        text: 'Benevoclic Support System',
        icon_url: 'https://cdn.discordapp.com/emojis/🏥.png',
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Crée un embed pour une mise à jour de statut
   */
  private createStatusUpdateEmbed(report: any, oldStatus: string, newStatus: string): DiscordEmbed {
    const color = this.getColorForStatus(newStatus);
    const emoji = this.getEmojiForStatus(newStatus);

    return {
      title: `${emoji} Mise à jour du ticket #${report.id}`,
      description: `**Statut:** ${oldStatus} → **${newStatus}**\n\n**Description:**\n${report.description}`,
      color: color,
      fields: [
        {
          name: '📅 Date de mise à jour',
          value: new Date().toLocaleString('fr-FR'),
          inline: true,
        },
        {
          name: '👤 Utilisateur',
          value: report.userEmail || 'Anonyme',
          inline: true,
        },
        {
          name: '🔗 URL de la page',
          value: report.pageUrl || 'Non spécifiée',
          inline: false,
        },
      ],
      footer: {
        text: 'Benevoclic Support System',
        icon_url: 'https://cdn.discordapp.com/emojis/📊.png',
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Envoie le webhook Discord
   */
  private async sendWebhook(payload: DiscordWebhookPayload): Promise<void> {
    await axios.post(this.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  private getColorForReportType(type: string): number {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 0xff6b6b;
      case 'TECHNICAL':
        return 0x4ecdc4;
      case 'USER_FEEDBACK':
        return 0x9b59b6;
      case 'OTHER':
        return 0xf39c12;
      default:
        return 0x95a5a6;
    }
  }

  /**
   * Retourne la couleur Discord selon le statut
   */
  private getColorForStatus(status: string): number {
    switch (status) {
      case 'PENDING':
        return 0xf39c12; // Orange
      case 'IN_PROGRESS':
        return 0x3498db; // Bleu
      case 'RESOLVED':
        return 0x27ae60; // Vert
      case 'REJECTED':
        return 0xe74c3c; // Rouge
      default:
        return 0x95a5a6; // Gris
    }
  }

  /**
   * Retourne l'emoji selon le type de signalement
   */
  private getEmojiForReportType(type: string): string {
    switch (type) {
      case 'ANNOUNCEMENT':
        return '📢';
      case 'TECHNICAL':
        return '🔧';
      case 'USER_FEEDBACK':
        return '💬';
      case 'OTHER':
        return '📝';
      default:
        return '❓';
    }
  }

  /**
   * Retourne l'emoji selon le statut
   */
  private getEmojiForStatus(status: string): string {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'IN_PROGRESS':
        return '🔄';
      case 'RESOLVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      default:
        return '📊';
    }
  }

  /**
   * Retourne le label du type de signalement
   */
  private getTypeLabel(type: string): string {
    switch (type) {
      case 'ANNOUNCEMENT':
        return "Signalement d'annonce";
      case 'TECHNICAL':
        return 'Problème technique';
      case 'USER_FEEDBACK':
        return 'Feedback utilisateur';
      case 'OTHER':
        return 'Autre demande';
      default:
        return 'Autre';
    }
  }

  /**
   * Retourne le label de la catégorie
   */
  private getCategoryLabel(category: string): string {
    const categoryLabels: { [key: string]: string } = {
      // Signalements d'annonces
      INAPPROPRIATE_CONTENT: 'Contenu inapproprié',
      OUTDATED_INFO: 'Informations obsolètes',
      WRONG_ADDRESS: 'Adresse incorrecte',
      WRONG_DATE_TIME: 'Date/heure incorrecte',
      WRONG_CAPACITY: 'Capacité incorrecte',
      INAPPROPRIATE_TAGS: 'Tags inappropriés',

      // Problèmes techniques
      CONNECTION_ISSUE: 'Problème de connexion',
      IMAGE_NOT_LOADING: 'Image ne se charge pas',
      RESPONSIVE_ISSUE: 'Problème responsive',
      SEARCH_PROBLEM: 'Problème de recherche',
      FORM_NOT_WORKING: 'Formulaire défaillant',
      SLOW_PERFORMANCE: 'Performance lente',

      // Feedback utilisateur
      FEATURE_REQUEST: 'Demande de fonctionnalité',
      BUG_REPORT: 'Rapport de bug',
      USABILITY_ISSUE: "Problème d'ergonomie",
      CONTENT_SUGGESTION: 'Suggestion de contenu',
      GENERAL_FEEDBACK: 'Feedback général',

      // Autres demandes
      GENERAL_INQUIRY: 'Demande générale',
      ACCOUNT_ISSUE: 'Problème de compte',
      BILLING_QUESTION: 'Question de facturation',
      PARTNERSHIP_REQUEST: 'Demande de partenariat',
      PRESS_INQUIRY: 'Demande de presse',

      // Par défaut
      OTHER: 'Autre',
    };

    return categoryLabels[category] || category;
  }
}
