

service AIService {
    function searchPlans(phrase: String) returns array of {
        planID;
        serviceName;
        planName;
        serviceDescription;
        relevance: Double;
    }
}