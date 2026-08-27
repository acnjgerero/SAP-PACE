
using {sap.pace as db} from './../db/schema';

service Catalog {
    entity Services       as projection on db.Services;
    entity ProjectRequest as projection on db.ProjectRequests;

    // Dropdown / value-help lists for the Project Request form
    @readonly entity ProjectTypes as projection on db.ProjectTypes;
    @readonly entity Markets      as projection on db.Markets;
}

// Render the two associations as fixed-value dropdowns (combo box) instead of a value-help dialog
annotate Catalog.ProjectRequest with {
    type   @Common.ValueListWithFixedValues;
    market @Common.ValueListWithFixedValues;
}
