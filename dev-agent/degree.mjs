// Degree matching is about the documented level and field, not a blanket
// equivalency between a minor, a different major and a higher qualification.
export const degreePattern =
  /\b(bachelor(?:'s)?|baccalaureate|master(?:'s)?|degree|ms|msc|bs|bsc|bscs|ph\.?d|doctorate)\b/i;
export function educationAssessment(s) {
  const ids = ["uoft", "quantic"];
  const uncertain = (
    explanation,
    question = "Does the employer accept the exact documented degree level and fields?",
  ) => ({ assessment: "UNCERTAIN", ids, explanation, question });
  const gap = (explanation) => ({
    assessment: "GAP",
    ids,
    explanation,
    question:
      "Is there authoritative evidence for this exact degree requirement?",
  });
  if (/\b(ph\.?d|doctorate)\b/i.test(s))
    return gap(
      "No reviewed doctoral qualification establishes this degree level.",
    );
  if (/\bABET\b/i.test(s))
    return gap(
      "No reviewed evidence establishes the specifically required ABET accreditation.",
    );
  if (
    /\b(gpa|grade.point|class rank|honors? standing|honours? standing|accredit\w*|recognized institution)\b/i.test(
      s,
    )
  )
    return uncertain(
      "Degree information is available, but the additional grade, accreditation or institution condition is not established by this public evidence.",
    );
  if (
    /\b(accounting|finance|economics|electrical|mechanical|civil|chemical|medicine|nursing|law|business administration|computer engineering|geology)\b/i.test(
      s,
    )
  )
    return gap(
      "The specified degree field is not established by the reviewed education evidence.",
    );
  const masters = /\b(master(?:'s)?|ms|msc)\b/i.test(s),
    bachelors = /\b(bachelor(?:'s)?|baccalaureate|bs|bsc|bscs)\b/i.test(s);
  if (masters && bachelors)
    return uncertain(
      "This line combines degree levels. Review each level and field separately.",
    );
  const gis =
      /\b(gis|geographic(?:al)? information (?:systems?|science))\b/i.test(s),
    software = /\bsoftware engineering\b/i.test(s),
    cs = /\b(computer science|bscs)\b/i.test(s),
    geography = /\bgeography\b/i.test(s);
  // Unknown modifiers must not be satisfied just because a supported field is
  // present (e.g. "GIS degree specialized in coastal hydrodynamics").
  let rest = s.replace(
    /\b(?:honours?|honors?|bachelor(?:'s)?|baccalaureate|master(?:'s)?|degree|ms|msc|bs|bsc|bscs|gis|geographic(?:al)? information (?:systems?|science)|software engineering|computer science|geography)\b/gi,
    " ",
  );
  const known = new Set(
    "a an the of in with and from science arts minor major required requirement minimum must have be is are completed completion relevant university college qualification qualifications undergraduate graduate education study studies".split(
      " ",
    ),
  );
  const unmapped = (rest.toLowerCase().match(/[a-z][a-z0-9.-]*/g) || []).filter(
    (x) => !known.has(x),
  );
  if (unmapped.length)
    return uncertain(
      "Related education is documented, but additional field, specialization or degree conditions remain unresolved.",
    );
  if (masters && software && !gis && !cs && !geography)
    return {
      assessment: "SUPPORTED",
      ids: ["quantic"],
      explanation:
        "Ahmed’s confirmed MS in Software Engineering matches the named level and field. The candidate-confirmation source is shown; no additional accreditation or grade claim is inferred.",
      question: null,
    };
  if (bachelors && gis && !software && !cs && !geography)
    return {
      assessment: "SUPPORTED",
      ids: ["uoft"],
      explanation:
        "The reviewed H.B.Sc. and GIS major match the named level and field.",
      question: null,
    };
  if (
    bachelors &&
    /\bminor\b/i.test(s) &&
    (cs || geography) &&
    !software &&
    !gis
  )
    return {
      assessment: "SUPPORTED",
      ids: ["uoft"],
      explanation:
        "The reviewed H.B.Sc. records Computer Science and Geography (Science) minors. A minor is not represented as the major.",
      question: null,
    };
  return uncertain(
    "The record shows an H.B.Sc. with a GIS major and Computer Science/Geography minors, plus an MS in Software Engineering. This exact level/field combination or equivalency needs review.",
  );
}
