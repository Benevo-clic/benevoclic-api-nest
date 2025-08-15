import { ApiProperty } from '@nestjs/swagger';

export class RecommendationDto {
  @ApiProperty({ description: 'Type de recommandation' })
  type: 'engagement' | 'retention' | 'objectives' | 'timing' | 'content';

  @ApiProperty({ description: 'Titre de la recommandation' })
  title: string;

  @ApiProperty({ description: 'Description détaillée de la recommandation' })
  description: string;

  @ApiProperty({ description: 'Priorité de la recommandation (1-5)' })
  priority: number;

  @ApiProperty({ description: 'Impact estimé de la recommandation (%)' })
  estimatedImpact: number;

  @ApiProperty({ description: 'Actions suggérées' })
  suggestedActions: string[];

  @ApiProperty({ description: 'Métriques associées' })
  relatedMetrics: string[];
}

export class RecommendationsResponseDto {
  @ApiProperty({ description: 'Liste des recommandations' })
  recommendations: RecommendationDto[];

  @ApiProperty({ description: 'Score global de performance' })
  overallScore: number;

  @ApiProperty({ description: "Période d'analyse" })
  period: {
    startDate: string;
    endDate: string;
  };
}
