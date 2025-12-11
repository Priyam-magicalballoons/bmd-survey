import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="bg-white w-full h-screen items-center justify-center flex flex-col">
      <h3 className="font-semibold text-center text-2xl bg-[#1692dc] text-white pt-4 py-2 h-full w-full mt-8 justify-center tracking-wide">
        DOCTOR CONSENT LETTER
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
          {`Consent for study conduction
          
`}
          <strong>Study:</strong>{" "}
          {`“A Nationwide Study on Epidemiology & Risk Factors of Osteopenia &/or Osteoporosis”
          
`}
          <i>
            (Please read the consent form carefully before signing this consent
            letter)
          </i>
          {`
          
I, hereby give my consent to `}
          <strong> Cipla Limited</strong>
          {`, through `}{" "}
          <strong>
            its employees, affiliates, or authorized
            representatives/consultants, including the designated vendor
          </strong>
          ,
          {` to collect my personal data such as my name, city, registration number, & any other necessary information (“Personal Information”) for the purpose of conducting the above-mentioned study on screening for Osteopenia/Osteoporosis & related risk factors.

I understand & grant permission to Cipla Limited to enroll my patients in this study to help assess the prevalence of Osteopenia/Osteoporosis & associated risk factors. The analysis derived from this study will be used for educational & awareness purposes among healthcare professionals & patients. All data will be anonymized & analysed & may be submitted, published, or presented in medical journals or conferences.

It is clarified that Cipla Limited will not disclose my personally identifiable information to any third party for commercial purposes, except as stated above. I understand that my Personal Information will be processed & protected by Cipla Limited. Further details regarding the use, storage, & retention of my Personal Information can be obtained by contacting Cipla at `}
          <a
            href="https://globalprivacy@cipla.com"
            className="text-blue-600 underline"
          >
            globalprivacy@cipla.com
          </a>
          {`.

This study does not involve the promotion of Cipla products or any form of consideration or commercial interest. I confirm that I have not received any consideration to promote any Cipla products.

I confirm that I have read & fully understood the study documents & contents of this letter. I hereby consent to participate in this study & authorize the recording, collection, storage, processing, sharing, & use of my personal data & that of my patients in relation to the Osteocare BMD Screening Camp facilitated by the vendor on behalf of Cipla Limited for the purposes of this study.

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
