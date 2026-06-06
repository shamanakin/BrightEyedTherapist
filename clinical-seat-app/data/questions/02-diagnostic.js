/* Domain 2 — Developing a Diagnostic Impression (11% of exam) */

(function (BANK) {
  BANK.push(
// ============ 2A. Mood, Anxiety, Thought (target: 3 items) ============
{
  id: 'DX-2A-001',
  domain: 2, subsection: '2A',
  stem: 'A 27-year-old client reports a two-week period during which he slept only three or four hours per night, felt unusually energetic and confident, started three new business ventures, spent $8,000 he did not have, and engaged in sexual encounters with two strangers. He now feels exhausted and "embarrassed about all of it." He reports prior episodes of low mood lasting weeks but no prior energized periods. Which of the following diagnoses is MOST consistent with the client\'s presentation?',
  options: [
    'Bipolar I disorder',
    'Bipolar II disorder',
    'Cyclothymic disorder',
    'Major depressive disorder with mixed features'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The episode described — decreased need for sleep, inflated mood and confidence, excessive involvement in pleasurable activities with painful consequences (spending, sexual indiscretions), and impairment significant enough to cause embarrassment — meets criteria for a manic episode. A single lifetime manic episode is sufficient for Bipolar I.',
    distractors: {
      1: 'Bipolar II requires hypomania, which does NOT include marked impairment. The financial damage and behaviors causing distress here cross the threshold to mania, not hypomania.',
      2: 'Cyclothymic disorder requires two years of fluctuating subthreshold symptoms — neither the manic nor depressive episodes here are subthreshold.',
      3: 'MDD with mixed features requires the client to currently meet criteria for a major depressive episode with concurrent manic/hypomanic symptoms. The described episode is a discrete manic episode, not a mixed depressive episode.'
    }
  },
  difficulty: 3,
  tags: ['bipolar', 'differential']
},
{
  id: 'DX-2A-002',
  domain: 2, subsection: '2A',
  stem: 'A 33-year-old client reports persistent worry that she cannot control about her health, finances, work performance, her children\'s safety, and her aging parents. The worry has been present "for as long as I can remember" but has worsened in the last year. She reports muscle tension, irritability, difficulty concentrating, and trouble sleeping. She denies discrete episodes of intense fear. Which of the following diagnoses is MOST consistent with this client\'s symptoms?',
  options: [
    'Generalized anxiety disorder',
    'Panic disorder',
    'Adjustment disorder with anxiety',
    'Obsessive-compulsive disorder'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Chronic, uncontrollable worry across multiple domains, paired with the associated physical symptoms (muscle tension, irritability, concentration and sleep difficulties), in the absence of discrete panic episodes, is the hallmark of GAD.',
    distractors: {
      1: 'Panic disorder requires recurrent unexpected panic attacks, which the client explicitly denies.',
      2: 'Adjustment disorder requires symptoms in response to an identifiable stressor within three months of onset; this client describes lifelong worry, not a stressor-bound presentation.',
      3: 'OCD requires recurrent obsessions and/or compulsions — intrusive thoughts experienced as unwanted, often with associated rituals. The worry described here is excessive but not obsessional in the OCD-specific sense, and no compulsions are reported.'
    }
  },
  difficulty: 2,
  tags: ['GAD', 'differential']
},
{
  id: 'DX-2A-003',
  domain: 2, subsection: '2A',
  stem: 'A 22-year-old client reports that for the past five months he has heard a voice criticizing him throughout the day, has come to believe his neighbors are monitoring his thoughts through "frequencies," and has stopped attending classes because he believes the professors are part of the surveillance. His family says he was "completely normal" until late last year. Which of the following actions should the therapist take?',
  options: [
    'Refer the client for psychiatric evaluation to assess for a psychotic disorder while continuing to monitor safety and engagement',
    'Provide cognitive-behavioral therapy targeting the client\'s distorted beliefs about being monitored',
    'Schedule a family session to gather collateral information before deciding on next steps',
    'Encourage the client to return to classes as behavioral activation for his withdrawal'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Persistent auditory hallucinations, paranoid delusions, and functional decline over five months in a young adult warrant urgent psychiatric evaluation to assess for a schizophrenia spectrum or other psychotic disorder. This is a referral question, not one the LMFT manages without psychiatric collaboration.',
    distractors: {
      1: 'CBT for psychosis exists, but launching it without psychiatric evaluation and treatment for the underlying disorder is clinically inappropriate and outside what the LMFT should do alone.',
      2: 'A family session for collateral information may be helpful at some point but is not the priority action — the client is presenting with active psychosis and needs psychiatric evaluation now.',
      3: 'Behavioral activation for withdrawal driven by paranoid delusions does not address the underlying disorder and may worsen distress.'
    }
  },
  difficulty: 3,
  tags: ['psychosis', 'referral']
},

// ============ 2B. Other Disorders of Clinical Significance (target: 3 items) ============
{
  id: 'DX-2B-001',
  domain: 2, subsection: '2B',
  stem: 'A 16-year-old client is brought to therapy by her parents, who report that she has lost a significant amount of weight over the past year. The client believes she is "still fat" despite being underweight, restricts her food intake severely, and exercises for hours daily. She has not menstruated in five months. She denies any binge-purge behaviors. Which of the following diagnoses is MOST consistent with this client\'s presentation?',
  options: [
    'Anorexia nervosa, restricting type',
    'Anorexia nervosa, binge-eating/purging type',
    'Avoidant/restrictive food intake disorder (ARFID)',
    'Other specified feeding or eating disorder'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Significantly low body weight, intense fear of weight gain reflected in distorted body image (believing she is "still fat" despite being underweight), and restrictive intake without binge-purge behaviors meets criteria for anorexia nervosa, restricting type.',
    distractors: {
      1: 'Binge-eating/purging type requires recurrent episodes of binge eating or purging behaviors; the stem explicitly states she denies these.',
      2: 'ARFID involves restrictive intake driven by lack of interest in food, sensory features, or fear of aversive consequences (e.g., choking), NOT body image disturbance. The body image distortion here points away from ARFID.',
      3: 'OSFED is for presentations that do not meet full criteria for a specified eating disorder. This client meets full criteria for anorexia.'
    }
  },
  difficulty: 2,
  tags: ['eating-disorder', 'differential']
},
{
  id: 'DX-2B-002',
  domain: 2, subsection: '2B',
  stem: 'A 38-year-old client presents with a long-standing pattern of unstable and intense relationships, identity disturbance, marked impulsivity in spending and sex, recurrent self-harming behavior, chronic feelings of emptiness, and intense anger when she feels abandoned. She reports that "this has been my life since high school." Which of the following diagnoses is MOST consistent with this client\'s presentation?',
  options: [
    'Borderline personality disorder',
    'Bipolar II disorder',
    'Histrionic personality disorder',
    'Complex post-traumatic stress disorder'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Long-standing pattern of unstable relationships, identity disturbance, impulsivity, self-harming behavior, chronic emptiness, and abandonment-related anger that has been "my life since high school" maps cleanly to borderline personality disorder.',
    distractors: {
      1: 'Bipolar II requires discrete hypomanic and major depressive episodes, not a pervasive lifelong pattern. The presentation described is trait-level, not episode-level.',
      2: 'Histrionic PD centers on excessive attention-seeking and emotional expression but does not include identity disturbance, chronic emptiness, or recurrent self-harm.',
      3: 'C-PTSD is not a DSM-5-TR diagnosis (it is ICD-11); for exam purposes the closest DSM-5-TR option would be PTSD with associated features, but the stem provides no trauma history or PTSD symptoms (intrusions, avoidance, hyperarousal, negative alterations).'
    }
  },
  difficulty: 3,
  tags: ['personality-disorder', 'BPD']
},
{
  id: 'DX-2B-003',
  domain: 2, subsection: '2B',
  stem: 'An 8-year-old client is brought to therapy by his foster parent for "anger problems." The foster parent reports the child argues constantly with adults, refuses to comply with requests, deliberately annoys others, and blames others for his mistakes. The behavior has been present for over a year and occurs at home and at school. The child does not destroy property, harm animals, or steal. Which of the following diagnoses is MOST consistent with this client\'s presentation?',
  options: [
    'Oppositional defiant disorder',
    'Conduct disorder',
    'Disruptive mood dysregulation disorder',
    'Attention-deficit/hyperactivity disorder'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'A pattern of angry/irritable mood, argumentative/defiant behavior, and vindictiveness lasting at least six months across more than one setting in a child, in the absence of more severe rule violations, matches ODD.',
    distractors: {
      1: 'Conduct disorder requires repetitive violation of others\' basic rights or major age-appropriate norms — aggression toward people/animals, destruction of property, deceitfulness/theft, or serious rule violations. The stem explicitly says these are absent.',
      2: 'DMDD requires severe recurrent temper outbursts AND a persistently irritable or angry mood between outbursts. The stem describes defiance but not the temper outburst component.',
      3: 'ADHD primarily features inattention and/or hyperactivity-impulsivity. While oppositional behavior can co-occur, the stem describes defiance specifically, not inattention or hyperactivity.'
    }
  },
  difficulty: 2,
  tags: ['child', 'differential', 'ODD']
},

// ===== Batch 2 additions =====

// --- 2A additions ---
{
  id: 'DX-2A-004',
  domain: 2, subsection: '2A',
  stem: 'A 29-year-old client reports that for the past three years she has experienced low mood "most of the day, more days than not." She is functional and works full-time but describes herself as having "a low-grade depression that never really lifts." She has had no two-month period of feeling well in those three years. Which of the following diagnoses is MOST consistent with this client\'s symptoms?',
  options: [
    'Persistent depressive disorder',
    'Major depressive disorder',
    'Adjustment disorder with depressed mood',
    'Cyclothymic disorder'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Persistent depressive disorder requires depressed mood most of the day, more days than not, for at least two years (adults), without a symptom-free interval of more than two months. The chronic, never-fully-remitting course described fits this diagnosis.',
    distractors: {
      1: 'MDD requires a discrete major depressive episode of at least two weeks with five or more specified symptoms. The presentation is chronic and lower-intensity, not episodic.',
      2: 'Adjustment disorder requires onset within three months of an identifiable stressor; the three-year chronic course and absence of a precipitating stressor in the stem do not support this.',
      3: 'Cyclothymic disorder requires fluctuating periods of hypomanic AND depressive symptoms; the stem describes consistent low mood without hypomanic episodes.'
    }
  },
  difficulty: 2,
  tags: ['PDD', 'differential']
},
{
  id: 'DX-2A-005',
  domain: 2, subsection: '2A',
  stem: 'A 23-year-old client describes thoughts about contamination that intrude many times a day. To manage the distress, she washes her hands repeatedly, follows a precise sequence when entering her apartment, and avoids touching doorknobs in public. She knows the thoughts are "irrational" but cannot stop the rituals. Which of the following diagnoses is MOST consistent with this client\'s symptoms?',
  options: [
    'Obsessive-compulsive disorder',
    'Generalized anxiety disorder',
    'Specific phobia',
    'Illness anxiety disorder'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Recurrent intrusive contamination-related thoughts experienced as unwanted, paired with compulsive behaviors performed to reduce distress, that the client recognizes as excessive, meets criteria for OCD.',
    distractors: {
      1: 'GAD involves excessive worry across multiple domains without the obsession-compulsion structure or specific rituals described.',
      2: 'Specific phobia involves fear of a specific object or situation but does not include the ritualized compulsive behaviors performed to reduce distress.',
      3: 'Illness anxiety disorder centers on fear of having or acquiring serious illness, not on contamination obsessions and washing/sequencing compulsions.'
    }
  },
  difficulty: 2,
  tags: ['OCD', 'differential']
},
{
  id: 'DX-2A-006',
  domain: 2, subsection: '2A',
  stem: 'A 34-year-old veteran initiates therapy 18 months after returning from deployment. He reports nightmares of combat events, intense distress when reminded of his service, avoidance of news about the war, persistent negative emotional states, hypervigilance, and difficulty sleeping. Symptoms have been present for over a year. Which of the following diagnoses is MOST consistent with this client\'s symptoms?',
  options: [
    'Post-traumatic stress disorder',
    'Acute stress disorder',
    'Adjustment disorder with mixed anxiety and depressed mood',
    'Persistent complex bereavement disorder'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Exposure to combat trauma followed by intrusion symptoms (nightmares), avoidance, negative alterations in mood, and arousal/reactivity symptoms (hypervigilance, sleep disturbance), persisting more than one month and well over a year, meets PTSD criteria.',
    distractors: {
      1: 'Acute stress disorder is limited to symptoms persisting between 3 days and 1 month after trauma; this client\'s symptoms have been present over a year, exceeding the ASD window.',
      2: 'Adjustment disorder is a residual category for stress responses that do not meet criteria for another disorder; the symptom profile here cleanly meets PTSD criteria.',
      3: 'Bereavement-related diagnoses require the death of a loved one as the precipitating loss, which is not described.'
    }
  },
  difficulty: 2,
  tags: ['PTSD', 'differential', 'duration']
},

// --- 2B additions ---
{
  id: 'DX-2B-004',
  domain: 2, subsection: '2B',
  stem: 'A 44-year-old client has been preoccupied for over a year with multiple physical symptoms — chronic fatigue, abdominal discomfort, headaches, and joint pain. She has had extensive medical workups, all negative. She spends hours daily researching her symptoms, has seen seven providers, and reports persistent anxiety about her health. Which of the following diagnoses is MOST consistent with this client\'s symptoms?',
  options: [
    'Somatic symptom disorder',
    'Illness anxiety disorder',
    'Conversion disorder (functional neurological symptom disorder)',
    'Factitious disorder'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Somatic symptom disorder requires one or more somatic symptoms causing distress or impairment, plus excessive thoughts/feelings/behaviors related to those symptoms (here: persistent anxiety, hours of research, seven providers). The somatic symptoms themselves need not have a medical explanation.',
    distractors: {
      1: 'Illness anxiety disorder involves preoccupation with HAVING or ACQUIRING a serious illness when somatic symptoms are MINIMAL or absent. The client has multiple bothersome somatic symptoms, which points to SSD rather than IAD.',
      2: 'Conversion disorder involves specific neurological symptoms (motor, sensory, seizures) that are incompatible with neurological conditions. The presentation here is multi-system somatic, not neurological.',
      3: 'Factitious disorder requires intentional falsification or induction of symptoms; the stem provides no evidence of intentional falsification.'
    }
  },
  difficulty: 3,
  tags: ['somatic', 'differential']
},
{
  id: 'DX-2B-005',
  domain: 2, subsection: '2B',
  stem: 'A 9-year-old client is brought to therapy by her parents for "trouble paying attention." They report that she frequently fails to follow through on instructions, loses school items, is easily distracted, makes careless mistakes on her schoolwork, and avoids tasks requiring sustained mental effort. The behaviors have been present since kindergarten and occur both at home and at school. She is not noticeably hyperactive or impulsive. Which of the following diagnoses is MOST consistent with this client\'s symptoms?',
  options: [
    'Attention-deficit/hyperactivity disorder, predominantly inattentive presentation',
    'Specific learning disorder with impairment in academic performance',
    'Generalized anxiety disorder with concentration difficulty',
    'Oppositional defiant disorder with school-context defiance'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Six or more inattentive symptoms persisting at least six months across multiple settings, with onset prior to age 12, meets criteria for ADHD inattentive presentation. The absence of significant hyperactivity-impulsivity specifies the inattentive subtype.',
    distractors: {
      1: 'Specific learning disorder is a difficulty with specific academic skills (reading, writing, math) below age-expected level despite adequate instruction; the stem describes attention difficulties, not specific academic skill deficits.',
      2: 'GAD requires excessive worry across multiple domains; the stem describes attentional difficulties, not worry.',
      3: 'ODD involves defiant, angry, and vindictive behavior; the stem describes attentional issues without defiance.'
    }
  },
  difficulty: 2,
  tags: ['ADHD', 'differential', 'child']
},

// ===== Batch 3 additions =====

// --- 2A additions ---
{
  id: 'DX-2A-007',
  domain: 2, subsection: '2A',
  stem: 'A 28-year-old client describes a recent panic attack at a grocery store: heart racing, shortness of breath, derealization, and a fear she was "going crazy." It came on without warning and peaked within 10 minutes. She has had four such attacks in the past two months and now avoids crowded stores out of fear of another. Which of the following diagnoses is MOST consistent with her symptoms?',
  options: [
    'Specific phobia',
    'Panic disorder',
    'Acute stress disorder',
    'Generalized anxiety disorder'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Recurrent unexpected panic attacks plus persistent concern about additional attacks and/or maladaptive behavior change (avoidance of crowded stores) meets criteria for panic disorder.',
    distractors: {
      0: 'Specific phobia is fear of a specific object/situation that is the focus of the anxiety. The panic attacks here are unexpected and recurrent, not fear-of-stimulus-bound.',
      2: 'Acute stress disorder requires exposure to a traumatic event and symptoms in the 3-day to 1-month window post-trauma. No traumatic event is described.',
      3: 'GAD is excessive worry across multiple domains; the presentation here is discrete panic episodes with anticipatory avoidance, not pervasive worry.'
    }
  },
  difficulty: 2,
  tags: ['panic-disorder', 'differential']
},
{
  id: 'DX-2A-008',
  domain: 2, subsection: '2A',
  stem: 'A 41-year-old client reports that she "doesn\'t feel real" much of the time, as if she is watching her life from outside her body. She describes the world around her as feeling "dreamlike" and "two-dimensional." She is fully oriented, has no psychotic symptoms, and the experiences have been present for over a year. Which of the following diagnoses is MOST consistent with her symptoms?',
  options: [
    'Depersonalization/derealization disorder',
    'Dissociative identity disorder',
    'Schizophrenia, residual phase',
    'Major depressive disorder with mixed features'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Persistent depersonalization ("watching from outside my body") and derealization (world feels dreamlike) with intact reality testing meets criteria for depersonalization/derealization disorder. The intact reality testing distinguishes this from psychotic disorders.',
    distractors: {
      1: 'DID requires the presence of two or more distinct personality states / identity disruption with recurrent gaps in recall — not described here.',
      2: 'Residual schizophrenia requires a history of an active phase with positive symptoms; the stem notes no psychotic symptoms.',
      3: 'MDD with mixed features requires a current depressive episode with concurrent manic/hypomanic symptoms; the stem describes dissociative experiences, not mood disorder.'
    }
  },
  difficulty: 3,
  tags: ['dissociative', 'differential']
},
{
  id: 'DX-2A-009',
  domain: 2, subsection: '2A',
  stem: 'A 19-year-old college student reports two weeks of low mood, sleeping 12+ hours a day, increased appetite with weight gain, and feeling "like lead" in his arms and legs. He says his mood "lifts" briefly when he sees his girlfriend. He has had similar episodes each fall during the past three years that resolved by spring. Which of the following diagnoses is MOST consistent with his symptoms?',
  options: [
    'Persistent depressive disorder with seasonal worsening',
    'Bipolar II disorder, current episode depressed',
    'Major depressive disorder, recurrent, with seasonal pattern and atypical features',
    'Cyclothymic disorder with seasonal pattern'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'A depressive episode with hypersomnia, hyperphagia/weight gain, leaden paralysis, and mood reactivity (lifts when seeing girlfriend) meets atypical-features criteria. The recurrent fall-to-spring pattern across multiple years meets the seasonal-pattern specifier within MDD.',
    distractors: {
      0: 'Persistent depressive disorder requires depressed mood most of the day, more days than not, for at least two years — without two-month symptom-free intervals. The fall-spring pattern described includes long symptom-free intervals.',
      1: 'Bipolar II requires hypomanic episodes, which are not described.',
      3: 'Cyclothymic disorder requires fluctuating hypomanic and depressive symptoms across two years without meeting full episode criteria. The episodes here are full depressive episodes.'
    }
  },
  difficulty: 3,
  tags: ['MDD-seasonal', 'atypical-features']
},
{
  id: 'DX-2A-010',
  domain: 2, subsection: '2A',
  stem: 'A 35-year-old client reports she has been experiencing intense fear and avoidance of social situations for as long as she can remember. She fears scrutiny in conversations, meetings, and meals in public. The fear is out of proportion to any actual threat and causes significant impairment. Which of the following diagnoses is MOST consistent with her symptoms?',
  options: [
    'Avoidant personality disorder',
    'Social anxiety disorder',
    'Agoraphobia',
    'Generalized anxiety disorder'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Marked fear/anxiety about social situations involving possible scrutiny, with disproportionate-to-threat character, avoidance, and significant impairment meets criteria for social anxiety disorder.',
    distractors: {
      0: 'Avoidant personality disorder shares features with social anxiety but is a pervasive personality pattern of inadequacy, hypersensitivity to negative evaluation, and avoidance across domains, not specifically scrutiny-focused social fear. The diagnostic boundary is contested but the stem points to SAD specifically.',
      2: 'Agoraphobia involves fear of situations where escape might be difficult or help unavailable (crowds, public transport, open spaces) — the avoidance pattern, not scrutiny-fear, is the marker.',
      3: 'GAD is pervasive worry across multiple domains; the focal social-evaluative fear here is more parsimoniously SAD.'
    }
  },
  difficulty: 3,
  tags: ['social-anxiety', 'differential']
},

// --- 2B additions ---
{
  id: 'DX-2B-006',
  domain: 2, subsection: '2B',
  stem: 'A 6-year-old client is brought to therapy by his parents who report he does not make eye contact, has limited interest in peers, is intensely focused on memorizing train schedules, becomes severely distressed by changes in routine, and has unusual sensory responses to sounds. The behaviors have been present since toddlerhood. Which of the following diagnoses is MOST consistent with his presentation?',
  options: [
    'Reactive attachment disorder',
    'Social (pragmatic) communication disorder',
    'Autism spectrum disorder',
    'Selective mutism'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Persistent deficits in social communication (limited eye contact, limited peer interest), restricted and repetitive interests (intense train-schedule focus), insistence on sameness, and atypical sensory responses, all present since toddlerhood, meet criteria for autism spectrum disorder.',
    distractors: {
      0: 'RAD requires a pattern of inhibited emotionally-withdrawn behavior toward caregivers AND a history of insufficient care. The stem describes a different presentation rooted in atypical neurodevelopment.',
      1: 'Social communication disorder includes pragmatic-language deficits but excludes restricted/repetitive behaviors. The intense focus and insistence on sameness here exclude SCD and indicate ASD.',
      3: 'Selective mutism is failure to speak in specific social situations despite speaking in others; the stem does not describe speech-specific avoidance.'
    }
  },
  difficulty: 2,
  tags: ['ASD', 'differential', 'child']
},
{
  id: 'DX-2B-007',
  domain: 2, subsection: '2B',
  stem: 'A 72-year-old client is brought to therapy by his daughter due to "memory problems." The daughter reports he repeats the same stories, forgets recent conversations, misplaces objects, and got lost driving to a familiar location. Symptoms have worsened gradually over 18 months. He is otherwise medically stable. Which of the following actions should the therapist take?',
  options: [
    'Provide cognitive remediation therapy to slow the apparent decline',
    'Refer the client for a comprehensive medical and neuropsychological evaluation to assess for neurocognitive disorder',
    'Address the daughter\'s caregiver burden as the primary clinical focus',
    'Initiate supportive psychotherapy for adjustment to aging'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Gradual cognitive decline over 18 months with multi-domain deficits (memory, navigation, daily functioning) at age 72 requires comprehensive medical and neuropsychological evaluation to assess for major or mild neurocognitive disorder and rule out reversible causes (medication effects, B12, thyroid, depression-related cognitive symptoms).',
    distractors: {
      0: 'Cognitive remediation without a diagnosis or workup misallocates intervention and risks missing reversible contributors.',
      2: 'Caregiver burden may eventually be relevant but is not the priority when the client himself has not been evaluated.',
      3: 'Supportive psychotherapy for adjustment to aging normalizes a symptom picture that warrants formal workup.'
    }
  },
  difficulty: 2,
  tags: ['neurocognitive', 'referral']
},
{
  id: 'DX-2B-008',
  domain: 2, subsection: '2B',
  stem: 'A 42-year-old client reports she has been unable to fall asleep for at least 60 minutes most nights for the past four months. She wakes multiple times during the night and feels exhausted by morning. Her daytime functioning is significantly impaired. She has good sleep hygiene and the difficulty is not better explained by another mental, medical, or substance-related condition. Which of the following diagnoses is MOST consistent with her presentation?',
  options: [
    'Insomnia disorder',
    'Hypersomnolence disorder',
    'Circadian rhythm sleep-wake disorder',
    'Major depressive disorder'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Predominant dissatisfaction with sleep quantity/quality, with difficulty initiating and maintaining sleep, occurring at least 3 nights/week for at least 3 months, with daytime impairment, not better explained by another condition, meets criteria for insomnia disorder.',
    distractors: {
      1: 'Hypersomnolence disorder features excessive sleepiness despite adequate sleep — the opposite of the difficulty-falling-asleep presentation here.',
      2: 'Circadian rhythm disorder involves misalignment between the sleep-wake cycle and the required schedule (e.g., delayed sleep phase); the stem describes difficulty initiating sleep regardless of timing.',
      3: 'MDD can include sleep disturbance but the stem provides no other depressive symptoms and explicitly notes the sleep difficulty is not better explained by another disorder.'
    }
  },
  difficulty: 2,
  tags: ['insomnia', 'sleep']
},
{
  id: 'DX-2B-009',
  domain: 2, subsection: '2B',
  stem: 'A 47-year-old man reports loss of sexual interest, difficulty achieving erections during partnered sex (though morning erections occur normally), and growing distress about his sexual functioning. The difficulty has been present for over six months. Medical workup including testosterone and cardiovascular screening was unremarkable. Which of the following diagnoses is MOST consistent with his presentation?',
  options: [
    'Male hypoactive sexual desire disorder',
    'Erectile disorder',
    'Female sexual interest/arousal disorder',
    'Substance/medication-induced sexual dysfunction'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Persistent difficulty achieving erections during partnered sexual activity (with intact morning erections, suggesting non-vascular etiology), present for over six months and causing distress, with medical workup unremarkable, meets criteria for erectile disorder. The intact morning erections point to a primarily psychogenic/situational etiology.',
    distractors: {
      0: 'Male HSDD primarily involves deficient/absent sexual desire/fantasy — the stem describes desire loss as secondary to the erectile difficulty rather than as the primary presentation. Erectile disorder is the better-fitting diagnosis.',
      2: 'FSIAD applies to female-identified individuals.',
      3: 'Substance/medication-induced dysfunction requires a temporal link to substance or medication use, which is not described.'
    }
  },
  difficulty: 3,
  tags: ['sexual-dysfunction', 'differential']
},

// --- 2A additions (continued, more differentials) ---
{
  id: 'DX-2A-011',
  domain: 2, subsection: '2A',
  stem: 'A 31-year-old client reports recurrent intrusive memories and nightmares of a car accident she was in two years ago. She avoids driving, becomes physically distressed when she sees the type of car involved, and feels detached from family and friends. She has not had a manic, hypomanic, or psychotic episode. Symptoms have been continuously present since the accident. Which of the following diagnoses is MOST consistent with her presentation?',
  options: [
    'Post-traumatic stress disorder',
    'Adjustment disorder with anxiety',
    'Acute stress disorder',
    'Panic disorder with agoraphobia'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Exposure to a qualifying traumatic event (car accident) followed by intrusion symptoms (memories, nightmares), avoidance (avoiding driving), negative alterations in mood (detachment from family/friends), and arousal/reactivity (physical distress at reminders), persisting more than one month and continuously for two years, meets criteria for PTSD.',
    distractors: {
      1: 'Adjustment disorder is a residual category for stress responses not meeting criteria for another disorder; the symptom profile here meets full PTSD criteria.',
      2: 'Acute stress disorder is limited to the 3-day to 1-month window post-trauma; this client\'s symptoms have been present for two years.',
      3: 'Panic disorder requires recurrent unexpected panic attacks, which are not described. The driving avoidance here is trauma-cue avoidance, not agoraphobic.'
    }
  },
  difficulty: 2,
  tags: ['PTSD', 'differential']
},

// ===== Batch 5: Diagnostic depth =====

{
  id: 'DX-2A-012',
  domain: 2, subsection: '2A',
  stem: 'A 26-year-old client reports two weeks of depressed mood, anhedonia, weight loss, insomnia, and feelings of worthlessness. She began a new medication for severe acne (isotretinoin) six weeks ago. She has no prior psychiatric history. Which of the following diagnoses is MOST consistent with her presentation?',
  options: [
    'Major depressive disorder',
    'Substance/medication-induced depressive disorder',
    'Adjustment disorder with depressed mood',
    'Persistent depressive disorder'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Onset of major-depressive-episode-like symptoms in temporal relationship to medication use (isotretinoin has a recognized association with depressive symptoms) supports substance/medication-induced depressive disorder. The temporal relationship to medication initiation, in someone with no prior psychiatric history, is the key feature.',
    distractors: {
      0: 'MDD requires that the symptoms not be better explained by substance/medication use; the temporal relationship to isotretinoin makes the medication-induced diagnosis more parsimonious.',
      2: 'Adjustment disorder requires an identifiable psychosocial stressor (other than the medication itself).',
      3: 'PDD requires depressed mood for at least 2 years; this is a 2-week presentation.'
    }
  },
  difficulty: 3,
  tags: ['medication-induced', 'differential', 'isotretinoin']
},
{
  id: 'DX-2A-013',
  domain: 2, subsection: '2A',
  stem: 'A 30-year-old client reports a 10-day period during which he had elevated mood, decreased need for sleep, increased goal-directed activity, talkativeness, and racing thoughts. He was more productive than usual, made some impulsive purchases, but maintained his work and relationships. He has had one prior major depressive episode. Which of the following diagnoses is MOST consistent with his presentation?',
  options: [
    'Bipolar I disorder, manic episode',
    'Bipolar II disorder, hypomanic episode',
    'Cyclothymic disorder',
    'Major depressive disorder with mixed features'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'A discrete period of elevated/expansive mood with 3+ associated symptoms (decreased sleep need, increased activity, talkativeness, racing thoughts, impulsivity) lasting 4+ days but WITHOUT marked impairment, hospitalization, or psychotic features, plus a history of major depressive episode, meets Bipolar II criteria (hypomania + MDE).',
    distractors: {
      0: 'Bipolar I requires a full manic episode with marked impairment or psychotic features; "maintained work and relationships" rules this out.',
      2: 'Cyclothymic disorder requires 2 years of fluctuating sub-threshold hypomanic and depressive symptoms; the prior MDE meets full episode criteria.',
      3: 'MDD with mixed features requires a current depressive episode with mixed manic/hypomanic symptoms; the current episode is hypomanic, not depressive.'
    }
  },
  difficulty: 3,
  tags: ['bipolar-II', 'hypomania', 'differential']
},
{
  id: 'DX-2B-010',
  domain: 2, subsection: '2B',
  stem: 'A 12-year-old client is brought to therapy by his parents who report he has been irritable "most of the time" for the past two years and has severe temper outbursts approximately three times per week, both at home and at school. Between outbursts, he is described as moody and easily frustrated. Which of the following diagnoses is MOST consistent with his presentation?',
  options: [
    'Oppositional defiant disorder',
    'Disruptive mood dysregulation disorder',
    'Bipolar I disorder',
    'Intermittent explosive disorder'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'DMDD requires severe recurrent temper outbursts (3+ per week) AND persistent irritable/angry mood between outbursts, present for 12+ months across multiple settings, with onset before age 10 (diagnosed between 6-18). The pattern described meets DMDD criteria.',
    distractors: {
      0: 'ODD involves defiance, argumentativeness, and vindictiveness; severe temper outbursts AND persistent irritable mood between are more specific to DMDD.',
      2: 'Bipolar I requires a discrete manic episode (4+ days of elevated mood); the chronic irritable mood here does not fit episodic bipolar.',
      3: 'IED features episodes of severe aggression but lacks the persistent between-outburst irritable mood criterion.'
    }
  },
  difficulty: 3,
  tags: ['DMDD', 'differential', 'child']
},
{
  id: 'DX-2B-011',
  domain: 2, subsection: '2B',
  stem: 'A 34-year-old client reports she experiences episodes of feeling as though parts of her own body are not real or attached to her, and sometimes hears her own voice as if from a distance. The episodes occur during stress, she remains fully aware of reality, and the experiences distress her. She has never lost memory of an episode. Which of the following diagnoses is MOST consistent with her presentation?',
  options: [
    'Dissociative identity disorder',
    'Dissociative amnesia',
    'Depersonalization/derealization disorder',
    'Schizophrenia spectrum disorder'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Depersonalization (feeling parts of body unreal, hearing self from a distance) experienced as ego-dystonic, with intact reality testing, during stress, meets criteria for depersonalization/derealization disorder.',
    distractors: {
      0: 'DID requires distinct personality states and recurrent gaps in memory; she explicitly reports no memory loss.',
      1: 'Dissociative amnesia requires inability to recall important personal information; she retains memory of episodes.',
      3: 'Schizophrenia spectrum requires positive psychotic symptoms with impaired reality testing; she remains fully aware of reality.'
    }
  },
  difficulty: 3,
  tags: ['dissociative', 'depersonalization', 'differential']
},

// ===== Items migrated from 06-law-ethics.js =====

{
  id: 'DX-2A-014',
  domain: 2, subsection: '2A',
  stem: 'A 45-year-old client reports two weeks of low mood, anhedonia, weight loss, insomnia, and feelings of worthlessness following her father\'s death three weeks ago. She is significantly distressed and her functioning is impaired. Which of the following diagnoses is MOST consistent with this client\'s presentation?',
  options: [
    'Adjustment disorder with depressed mood',
    'Major depressive disorder',
    'Bereavement (V62.82) — exclusion applies',
    'Persistent depressive disorder'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'DSM-5 and DSM-5-TR removed the "bereavement exclusion" from MDD — major depressive episodes may be diagnosed even when occurring within bereavement context, when criteria are otherwise met. This presentation meets MDD criteria; bereavement context is noted but does not exclude the diagnosis.',
    distractors: {
      0: 'Adjustment disorder is a residual category; when MDD criteria are met, MDD takes precedence.',
      2: 'Bereavement as a V-code with exclusion from MDD was removed in DSM-5. This is a common pre-DSM-5 understanding that is now incorrect.',
      3: 'PDD requires depressed mood for at least 2 years; this is a 2-week presentation.'
    }
  },
  difficulty: 3,
  tags: ['MDD-bereavement', 'DSM-5-change']
},
{
  id: 'DX-2A-015',
  domain: 2, subsection: '2A',
  stem: 'A 35-year-old client describes intrusive memories, nightmares, and hypervigilance following a violent assault she experienced six weeks ago. Symptoms have been present continuously since the event and significantly impair her functioning. Which of the following diagnoses is MOST consistent with her presentation?',
  options: [
    'Acute stress disorder',
    'Post-traumatic stress disorder',
    'Adjustment disorder with anxiety',
    'Other specified trauma- and stressor-related disorder'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'PTSD requires symptoms persisting more than 1 month after the traumatic event. At 6 weeks (more than 1 month) post-trauma, with the full symptom profile described and functional impairment, PTSD is the appropriate diagnosis.',
    distractors: {
      0: 'ASD is limited to the 3-day to 1-month window post-trauma. At 6 weeks, this window has closed.',
      2: 'Adjustment disorder is a residual category; when PTSD criteria are met, PTSD takes precedence.',
      3: 'OSTSD is for presentations not meeting full criteria for a specified trauma disorder; PTSD criteria are met here.'
    }
  },
  difficulty: 2,
  tags: ['PTSD-timing', 'ASD-vs-PTSD']
},
{
  id: 'DX-2B-012',
  domain: 2, subsection: '2B',
  stem: 'A 16-year-old client has lost a significant amount of weight, has a fear of weight gain, restricts food intake severely, and exercises compulsively. Her BMI is in the low-normal range (not severely underweight). She has not menstruated in three months. Which of the following diagnoses is MOST consistent with this client\'s presentation?',
  options: [
    'Anorexia nervosa, restricting type',
    'Atypical anorexia nervosa within Other Specified Feeding or Eating Disorder',
    'Avoidant/Restrictive Food Intake Disorder',
    'Bulimia nervosa, non-purging type'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'DSM-5-TR includes "atypical anorexia nervosa" under Other Specified Feeding or Eating Disorder (OSFED) for presentations where all criteria for AN are met EXCEPT that the weight is not significantly low. The clinical severity is equivalent or greater than typical AN; the diagnosis acknowledges this.',
    distractors: {
      0: 'Full anorexia nervosa requires significantly low weight; this client\'s BMI is low-normal.',
      2: 'ARFID involves restrictive intake driven by sensory features, lack of interest, or fear of aversive consequences — NOT body image disturbance. This presentation includes fear of weight gain (body image disturbance).',
      3: 'Bulimia nervosa requires recurrent binge eating and compensatory behaviors; not described here.'
    }
  },
  difficulty: 3,
  tags: ['atypical-AN', 'OSFED', 'DSM-5-TR']
}
  );
})(window.LMFT_BANK);
