"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSampleNews1738699107040 = void 0;
class AddSampleNews1738699107040 {
    async up(queryRunner) {
        const author1 = await queryRunner.query(`
            SELECT id FROM "users" WHERE email = 'yazar1@tellioglu.com'
        `);
        const author2 = await queryRunner.query(`
            SELECT id FROM "users" WHERE email = 'yazar2@tellioglu.com'
        `);
        const categories = await queryRunner.query(`
            SELECT id, name FROM "categories"
        `);
        const categoryMap = categories.reduce((acc, cat) => {
            acc[cat.name] = cat.id;
            return acc;
        }, {});
        const news = [
            {
                title: 'Yapay Zeka Teknolojisinde Yeni Gelişme',
                content: 'Yapay zeka alanında çığır açan yeni bir gelişme duyuruldu. Araştırmacılar, insan beyninin çalışma prensiplerini daha iyi taklit edebilen yeni bir algoritma geliştirdi.',
                imageUrl: 'https://picsum.photos/800/400',
                authorId: author1[0].id,
                categoryId: categoryMap['Teknoloji'],
                viewCount: 150
            },
            {
                title: 'Sağlıklı Yaşam İçin Öneriler',
                content: 'Uzmanlar, günlük hayatta uygulayabileceğimiz basit ama etkili sağlıklı yaşam önerilerini paylaştı. Düzenli egzersiz ve dengeli beslenmenin önemi vurgulandı.',
                imageUrl: 'https://picsum.photos/800/400',
                authorId: author2[0].id,
                categoryId: categoryMap['Sağlık'],
                viewCount: 120
            },
            {
                title: 'Ekonomide Son Gelişmeler',
                content: 'Merkez Bankası\'nın son faiz kararı piyasaları hareketlendirdi. Ekonomistler, alınan kararların orta ve uzun vadeli etkilerini değerlendirdi.',
                imageUrl: 'https://picsum.photos/800/400',
                authorId: author1[0].id,
                categoryId: categoryMap['Ekonomi'],
                viewCount: 200
            },
            {
                title: 'Sporda Tarihi Başarı',
                content: 'Milli sporcumuz dünya şampiyonasında altın madalya kazandı. Bu başarı, Türk spor tarihine altın harflerle yazıldı.',
                imageUrl: 'https://picsum.photos/800/400',
                authorId: author2[0].id,
                categoryId: categoryMap['Spor'],
                viewCount: 180
            },
            {
                title: 'Sanat Dünyasında Yeni Akımlar',
                content: 'Modern sanat dünyasında yeni bir akım kendini göstermeye başladı. Dijital sanat ve NFT\'lerin yükselişi devam ediyor.',
                imageUrl: 'https://picsum.photos/800/400',
                authorId: author1[0].id,
                categoryId: categoryMap['Kültür Sanat'],
                viewCount: 90
            }
        ];
        for (const newsItem of news) {
            await queryRunner.query(`
                INSERT INTO "news" (
                    title, content, "imageUrl", "authorId", "categoryId", 
                    "viewCount", "isActive", "createdAt", "updatedAt"
                )
                VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [
                newsItem.title,
                newsItem.content,
                newsItem.imageUrl,
                newsItem.authorId,
                newsItem.categoryId,
                newsItem.viewCount
            ]);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "news"`);
    }
}
exports.AddSampleNews1738699107040 = AddSampleNews1738699107040;
//# sourceMappingURL=1738699107040-AddSampleNews.js.map