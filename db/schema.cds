namespace sap.pace;
using { cuid, managed, Currency, sap.common.CodeList } from '@sap/cds/common';

entity ProjectTypes : CodeList {
    key code : String(20) @title: 'Project Type';
}

entity Markets : CodeList {
    key code : String(20) @title: 'Market';
}

entity Services : cuid, managed {
    name          : String(111)      @mandatory @title: 'Service Name';
    plans          : composition of many Plans on plans.parent = $self;
    currency      : Currency;        // -> Association to sap.common.Currencies
    status        : Boolean          @title: 'Status' default true;   // true = Active
}

entity Plans : cuid, managed {
    parent          : Association to Services;
    name            : String(255)      @mandatory @title: 'Plan Coverage';
    techFeature     : LargeString      @mandatory @title: 'Technical Features Inclusion';
    costByMetrics   : String(111)      @title: 'Cost by Metrics';
    imc             : Decimal(15, 2)   @title: 'SAP Indicative Monthly Cost' 
                                    @Measures.ISOCurrency: parent.currency_code default 0;
}

entity ProjectRequests : cuid, managed {
    name            : String(111) @mandatory @title: 'Project Name';
    type            : Association to ProjectTypes @mandatory @title: 'Project Type';
    market          : Association to Markets      @mandatory @title: 'Market';
    clientName      : String(111) @mandatory @title: 'Client Name';
    projectPOC      : String(111) @mandatory @title: 'Project POC';
    solutionArchPOC : String(111)            @title: 'Solution Architect POC';
    status          : String(20)  default 'Draft';
    features        : Composition of many RequestFeatures on features.parent = $self;
    services        : Composition of many RequestServices on services.parent = $self;
}

entity RequestFeatures : cuid {
    parent      : Association to ProjectRequests;
    name        : String(111)  @title: 'Feature Name';
    description : String(1000) @title: 'Description';
}

entity RequestServices : cuid {
    parent         : Association to ProjectRequests;
    service        : Association to Services @mandatory @assert.target;
    plan           : Association to Plans    @mandatory @assert.target @title: 'Plan';
    noOfmetrics    : Integer default 1 @title: 'No. of Metrics';
    currency       : Currency;
    estMonthlyCost : Decimal(15, 2) = noOfmetrics * plan.imc 
                                @Measures.ISOCurrency: currency_code
                                @title: 'Estimated Monthly Cost';
}
