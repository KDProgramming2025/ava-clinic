import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, Heart, Users, Target, CheckCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Progress } from '../ui/progress';
import { api } from '../../api/client';
import { SEO } from '../SEO';
import { resolveMediaUrl } from '../../utils/media';

interface TimelineItem {
  id?: string;
  year: number;
  title: string;
  titleEn?: string | null;
  titleFa?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFa?: string | null;
}
interface ValueItem {
  id?: string;
  title: string;
  titleEn?: string | null;
  titleFa?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFa?: string | null;
  icon?: string | null;
}
interface SkillItem {
  id?: string;
  name: string;
  nameEn?: string | null;
  nameFa?: string | null;
  level: number;
}
interface Mission {
  heading?: string | null;
  headingEn?: string | null;
  headingFa?: string | null;
  paragraph?: string | null;
  paragraphEn?: string | null;
  paragraphFa?: string | null;
  imageHeroUrl?: string | null;
  imageSecondaryUrl?: string | null;
}
interface MissionBullet {
  id?: string;
  text: string;
  textEn?: string | null;
  textFa?: string | null;
}
interface TeamMember { 
  id?: string; 
  name: string; 
  nameEn?: string | null;
  nameFa?: string | null;
  role: string; 
  roleEn?: string | null;
  roleFa?: string | null;
  bio?: string | null; 
  bioEn?: string | null;
  bioFa?: string | null;
  image?: string | null; 
  active?: boolean; 
}
interface StatItem { icon: string; value: string; label: string; labelEn?: string | null; labelFa?: string | null; id?: string; }

export function AboutPage() {
  const { isRTL, t, trc, language } = useLanguage();

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [values, setValues] = useState<ValueItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [mission, setMission] = useState<Mission | null>(null);
  const [missionBullets, setMissionBullets] = useState<MissionBullet[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pickLocalized = (fa?: string | null, en?: string | null, fallback?: string | null) => {
    const order = language === 'fa' ? [fa, en, fallback] : [en, fa, fallback];
    for (const value of order) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length) return trimmed;
      }
    }
    return typeof fallback === 'string' ? fallback.trim() : '';
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [aboutData, teamData] = await Promise.all([
          api.about(),
          api.team(),
        ]);
        if (cancelled) return;
        const timelineItems = Array.isArray(aboutData.timeline) ? aboutData.timeline : [];
        setTimeline(timelineItems.map((item: any) => ({ ...item, year: Number(item.year) || 0 })).sort((a, b) => a.year - b.year));
        setValues(Array.isArray(aboutData.values) ? aboutData.values : []);
        setSkills((Array.isArray(aboutData.skills) ? aboutData.skills : []).map((s: any) => ({ ...s, level: Number(s.level) || 0 })));
        setMission(aboutData.mission || null);
        setMissionBullets(Array.isArray(aboutData.missionBullets) ? aboutData.missionBullets : []);
        setTeam(Array.isArray(teamData) ? teamData : []);
        const aboutStats = Array.isArray(aboutData?.stats) ? aboutData.stats : [];
        const mappedStats = aboutStats.map((s: any) => ({
          icon: s.icon || 'award',
          value: String(s.value ?? ''),
          label: s.label || '',
          labelEn: s.labelEn ?? s.label ?? null,
          labelFa: s.labelFa ?? s.label ?? null,
          id: s.id,
        }));
        setStats(mappedStats);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load About content');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const missionHeroParagraph = pickLocalized(mission?.paragraphFa, mission?.paragraphEn, mission?.paragraph || t('about.lead')) || t('about.lead');
  const missionHeadingLocalized = pickLocalized(mission?.headingFa, mission?.headingEn, mission?.heading || t('about.skillsTitle')) || t('about.skillsTitle');
  const missionParagraphLocalized = pickLocalized(mission?.paragraphFa, mission?.paragraphEn, mission?.paragraph || t('about.skillsSubtitle')) || t('about.skillsSubtitle');

  const iconComponent = (name: string) => {
    switch ((name || '').toLowerCase()) {
      case 'heart': return Heart;
      case 'award': return Award;
      case 'target': return Target;
      case 'users': return Users;
      default: return Heart; // default icon
    }
  };

  const renderIcon = (iconValue: string | null | undefined, className: string = 'w-8 h-8') => {
    if (!iconValue) {
      const DefaultIcon = Heart;
      return <DefaultIcon className={className} />;
    }
    // Check if it's an uploaded image (URL)
    if (iconValue.includes('/') || iconValue.startsWith('http')) {
      return <img src={resolveMediaUrl(iconValue)} alt="icon" className={className + ' object-contain'} />;
    }
    // Otherwise treat as icon name
    const Icon = iconComponent(iconValue);
    return <Icon className={className} />;
  };

  return (
    <div className="pt-20 min-h-screen">
      {/* SEO Meta */}
      {(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.example.com';
        const canonical = `${origin}/about`;
        const alternates = [
          { hrefLang: 'fa', href: `${origin}/about` },
          { hrefLang: 'en', href: `${origin}/about?lang=en` }
        ];
        const breadcrumb = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('home'), item: origin + '/' },
            { '@type': 'ListItem', position: 2, name: t('about.title'), item: canonical }
          ]
        };
        return (
          <SEO
            title={t('about.title')}
            description={t('about.lead')}
            canonical={canonical}
            alternates={alternates}
            image="/og-image.jpg"
            type="website"
            jsonLd={breadcrumb}
          />
        );
      })()}
      {error && <div className="text-center py-6 text-red-600">{error}</div>}
        <>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              { /* Use translation for hero title */ }
              {t('about.title')}
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              {missionHeroParagraph}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {mission?.imageHeroUrl ? (
                <ImageWithFallback
                  src={mission.imageHeroUrl}
                  alt={t('about.missionHeroAlt')}
                  className="rounded-3xl shadow-2xl"
                />
              ) : (
                <div className="rounded-3xl shadow-2xl h-[360px] bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200" aria-label={t('about.missionHeroAlt')} />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-gray-900">{missionHeadingLocalized}</h2>
              <p className="text-gray-700">
                {missionParagraphLocalized}
              </p>
              <div className="space-y-4">
                {(missionBullets || []).map((b, index) => {
                  const bulletText = pickLocalized(b.textFa, b.textEn, b.text);
                  return (
                    <motion.div
                      key={b.id || index}
                      initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-6 h-6 text-pink-500 flex-shrink-0" />
                      <span className="text-gray-700">{bulletText}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('about.valuesTitle')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('about.valuesSubtitle')}
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8">
            {(values.length ? values : loading ? Array.from({length:4}).map(()=>({title:'', description:'', icon:'heart'})) : []).map((value: any, index) => {
              const localizedTitle = pickLocalized(value.titleFa, value.titleEn, value.title);
              const localizedDescription = pickLocalized(value.descriptionFa, value.descriptionEn, value.description);
              return (
                <motion.div
                  key={value.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="sm:w-80 lg:w-72"
                >
                  <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-pink-50/30">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {loading ? <div className="w-8 h-8 bg-white/40 rounded animate-pulse" /> : renderIcon(value.icon, 'w-8 h-8 text-white')}
                    </div>
                    <h3 className="mb-3 text-gray-900">
                      {loading ? <div className="h-5 w-2/3 mx-auto bg-gray-200 rounded animate-pulse" /> : localizedTitle}
                    </h3>
                    <p className="text-gray-600">
                      {loading ? (
                        <>
                          <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                          <div className="h-4 w-5/6 mx-auto bg-gray-200 rounded animate-pulse" />
                        </>
                      ) : (
                        localizedDescription
                      )}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('about.timelineTitle')}
            </h2>
            <p className="text-gray-600">
              {t('about.timelineSubtitle')}
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-pink-500 to-purple-600" />

            <div className="space-y-12">
              {(timeline.length ? timeline : loading ? Array.from({length:3}).map(()=>({year: '—', title:'', description:''})) : []).map((item: any, index) => {
                const localizedTitle = pickLocalized(item.titleFa, item.titleEn, item.title);
                const localizedDescription = pickLocalized(item.descriptionFa, item.descriptionEn, item.description);
                return (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? (isRTL ? 50 : -50) : (isRTL ? -50 : 50) }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? 'text-right rtl:text-left' : 'text-left rtl:text-right'}`}>
                      <Card className="p-6 bg-white shadow-lg inline-block">
                        <div className="text-pink-600 mb-2">{loading ? <span className="inline-block h-4 w-12 bg-gray-200 rounded animate-pulse" /> : item.year}</div>
                        <h3 className="mb-2 text-gray-900">{loading ? <div className="h-5 w-2/3 inline-block bg-gray-200 rounded animate-pulse" /> : localizedTitle}</h3>
                        <p className="text-gray-600">{loading ? <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" /> : localizedDescription}</p>
                      </Card>
                    </div>
                    <div className="w-4 h-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full ring-4 ring-white shadow-lg z-10" />
                    <div className="flex-1" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t('about.skillsTitle')}
              </h2>
              <p className="text-gray-700 mb-8">
                {t('about.skillsSubtitle')}
              </p>
              <div className="space-y-6">
                {(skills.length ? skills : loading ? Array.from({length:5}).map(()=>({name:'', level:0})) : []).map((skill: any, index) => {
                  const skillName = pickLocalized(skill.nameFa, skill.nameEn, skill.name);
                  return (
                    <motion.div
                      key={skill.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-900">{loading ? <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" /> : skillName}</span>
                        <span className="text-pink-600">{loading ? <span className="inline-block h-4 w-10 bg-gray-200 rounded animate-pulse" /> : `${skill.level}%`}</span>
                      </div>
                      {loading ? (
                        <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
                      ) : (
                        <Progress value={skill.level} className="h-2" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {mission?.imageSecondaryUrl ? (
                <ImageWithFallback
                  src={mission.imageSecondaryUrl}
                  alt={t('about.missionSecondaryAlt')}
                  className="rounded-3xl shadow-2xl"
                />
              ) : (
                <div className="rounded-3xl shadow-2xl h-[360px] bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200" aria-label={t('about.missionSecondaryAlt')} />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('about.teamTitle')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('about.teamSubtitle')}
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8">
            {(team.length ? team.filter(m => m.active !== false) : loading ? Array.from({length:4}).map(()=>({name:'', role:'', bio:''})) : []).map((member: any, index) => {
              const memberName = pickLocalized(member.nameFa, member.nameEn, member.name);
              const memberRole = pickLocalized(member.roleFa, member.roleEn, member.role);
              const memberBio = pickLocalized(member.bioFa, member.bioEn, member.bio);
              
              return (
                <motion.div
                  key={member.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="sm:w-80 lg:w-72"
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                    <div className="relative h-64 overflow-hidden">
                      {loading ? (
                        <div className="w-full h-full bg-gray-200 animate-pulse" />
                      ) : (
                        <>
                          <ImageWithFallback
                            src={member.image || undefined}
                            alt={memberName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </>
                      )}
                    </div>
                    <div className="p-6 text-center bg-white">
                      <h3 className="mb-2 text-gray-900">{loading ? <div className="h-5 w-2/3 mx-auto bg-gray-200 rounded animate-pulse" /> : memberName}</h3>
                      <p className="text-pink-600 mb-3">{loading ? <div className="h-4 w-1/2 mx-auto bg-gray-200 rounded animate-pulse" /> : memberRole}</p>
                      <p className="text-gray-600">{loading ? <div className="h-4 w-5/6 mx-auto bg-gray-200 rounded animate-pulse" /> : memberBio || ''}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
        {/* Stats */}
        <section className="py-20 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-8">
              {(stats.length ? stats : loading ? Array.from({length:4}).map(()=>({icon:'award', value:'', label:''})) : []).map((stat: any, index) => {
                const statLabel = pickLocalized(stat.labelFa, stat.labelEn, stat.label);
                return (
                  <motion.div
                    key={stat.id || index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center text-white sm:w-64 lg:w-56"
                  >
                    {loading ? (
                      <div className="w-12 h-12 mx-auto mb-4 bg-white/30 rounded-full animate-pulse" />
                    ) : (
                      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        {renderIcon(stat.icon, 'w-12 h-12')}
                      </div>
                    )}
                    <div className="mb-2 text-3xl font-bold">{loading ? <div className="h-8 w-16 mx-auto bg-white/40 rounded animate-pulse" /> : stat.value}</div>
                    <p className="text-white/90">{loading ? <span className="inline-block h-4 w-20 bg-white/30 rounded animate-pulse" /> : statLabel}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        </>
    </div>
  );
}
