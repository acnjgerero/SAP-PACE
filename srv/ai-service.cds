

service AIService {
    function searchPlans(phrase: String) returns array of {
        planID             : UUID;
        serviceName        : String;
        planName           : String;
        serviceDescription : String;
        relevance          : Double;
    }
}