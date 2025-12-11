import React from "react";

const page = () => {
  return (
    <div className="bg-white w-full h-screen items-center justify-center flex flex-col">
      <h3 className="font-semibold text-center text-2xl bg-[#1692dc] text-white pt-4 py-2 h-full w-full mt-8 justify-center tracking-wide">
        PATIENT CONSENT LETTER
      </h3>
      <div className="lg:max-w-1/3 max-h-screen p-5">
        <pre className=" font-sans whitespace-pre-wrap">
          <strong>
            {`
To,
Cipla Limited,
Peninsula Business Park
Ganpatrao Kadam Marg
Lower Parel
Mumbai - 400013

Subject: `}
          </strong>
          {`Consent for study artipation
          
`}
          <strong>Study:</strong>{" "}
          {`“A Nationwide Study on Epidemiology & Risk Factors of Osteopenia and/or Osteoporosis”
          
`}
          <i>
            (Please read the consent form carefully before signing this consent
            letter)
          </i>
          {`

I, the undersigned, hereby state as follows:

I give my consent to `}
          <strong> Cipla Limited</strong>
          {`, through its employees, affiliates, or `}{" "}
          <strong>
            authorized representatives/consultants, including the designated
            vendor
          </strong>
          {`, to collect my personal data such as my name, age, gender, and any other necessary information (“Personal Information”) for the purpose of conducting the above-mentioned study on screening for Osteopenia/Osteoporosis and related risk factors.

I grant permission to participate in this study and authorize Cipla Limited to use the information shared by me to understand the prevalence of Osteopenia/Osteoporosis in India. The analysis of this data will be used for educational and awareness purposes. All data will be anonymized, analysed and may be submitted, published, or presented in medical journals or conferences.

It is clarified that Cipla Limited will not disclose my personally identifiable information to any third party for commercial purposes, except as stated above.

I understand that my Personal Information will be processed and protected by Cipla Limited. Further details regarding the use, storage, and retention of my Personal Information can be obtained by contacting Cipla at `}
          <a
            href="https://globalprivacy@cipla.com"
            className="text-blue-600 underline"
          >
            globalprivacy@cipla.com
          </a>
          {`.

I confirm that I have read and fully understood the contents of this Privacy Notice. I hereby consent to the recording, collection, storage, processing, sharing, and use of my personal data in relation to the `}{" "}
          <strong>
            Osteocare BMD Screening Camp facilitated by the vendor on behalf of
            Cipla{" "}
          </strong>
          {`Limited for the purposes of this study.
          
`}
          <i>
            (In the event this document is translated into any other language,
            the English version shall prevail.)
          </i>
          {`
          
          `}
        </pre>
      </div>
    </div>
  );
};

export default page;
