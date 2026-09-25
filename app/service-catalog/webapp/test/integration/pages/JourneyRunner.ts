import JourneyRunner from "sap/fe/test/JourneyRunner";
import ListReport from "sap/fe/test/ListReport";
import ObjectPage from "sap/fe/test/ObjectPage";
import CustomServicesListGenerated from "./ServicesList.gen";
import CustomServicesObjectPageGenerated from "./ServicesObjectPage.gen";

const runner = new JourneyRunner({
    launchUrl: sap.ui.require.toUrl("sap/pace/ui/service/catalog/servicecatalog") + "/test/flp.html#app-preview",
    pages: {
        onTheServicesListGenerated: new ListReport(
            {
                appId: "sap.pace.ui.service.catalog.servicecatalog",
                componentId: "ServicesList",
                entitySet: "",
                contextPath: "/Services"
            },
            CustomServicesListGenerated
        ),
        onTheServicesObjectPageGenerated: new ObjectPage(
            {
                appId: "sap.pace.ui.service.catalog.servicecatalog",
                componentId: "ServicesObjectPage",
                entitySet: "",
                contextPath: "/Services"
            },
            CustomServicesObjectPageGenerated
        )
    },
    async: true
});

export default runner;
