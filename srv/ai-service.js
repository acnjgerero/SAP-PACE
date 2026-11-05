const cds = require('@sap/cds');
// Model name is ignored on SQLite (@cap-js/ai uses its local model) and used on SAP HANA
const MODEL = 'SAP_GXY.20250407'

class AIService extends cds.ApplicationService{ async init() {
    
    this.on('searchPlans', async(req) => {
        const {phrase} = req.data;
        if (!phrase?.trim()) return req.reject(400, 'Enter search phrase');

        return SELECT.from('sap.pace.Plans').columns`
            ID          as planID,
            parent.name as serviceName,
            name        as planName,
            parent.description as serviceDescription,
            cosine_similarity(
                vector_embedding(
                    'Service: ' || parent.name || '. '
                    || coalesce(parent.description, '')
                    || ' Plan: ' || name
                    || '. Features: ' || techFeature,
                    'DOCUMENT', ${MODEL}),
                vector_embedding(${phrase}, 'QUERY', ${MODEL})
            ) as relevance`
            .orderBy`relevance desc`
            .limit(5)
    })
    return super.init();
}};

module.exports = { AIService };