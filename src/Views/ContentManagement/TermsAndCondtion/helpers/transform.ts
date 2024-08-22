// Define types for the SectionItem (if necessary for a different part of the form)
interface SectionItem {
    content: string;
}

// Define types for the Terms and Conditions form data
export interface TermsAndConditionsFormData {
    title: string;
    description: string;
    moreInormationTitle: string;
    sections: string[];
}

// Define the transform function to convert form data to API request format
export const transformAPIRequestDataTermsAndConditions = (
    data: TermsAndConditionsFormData,
    roadMap: SectionItem[]
) => {
    return {
            title: data.title,
            description: data.description,
            moreInormationTitle: data.moreInormationTitle,
            sections: roadMap.map(section => section.content)
    };
}

// Define the transform function to convert API response data back to form format
export const transAPIRequestDataToFormTermsAndConditions = (
    data: any // Assuming API response data might not be of type TermsAndConditionsFormData
) => {
    return {
        title: data?.title || '',
        description: data?.description || '',
        moreInormationTitle: data?.moreInormationTitle || '',
    };
};

// Define types for the RoadMapItem (if necessary for a different part of the form)
export interface RoadMapItem {
    id?: string;
    title: string;
    content?: string;
    companyLogo?: File | string;
    moreInormationTitle?: string;
    errors: { [key: string]: string };
    [key: string]: any;
}
