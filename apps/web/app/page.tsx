'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import './landing.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant'
})
const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans'
})

export default function LandingPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const heroPatternRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        if (error.message.includes('Refresh Token Not Found')) {
          supabase.auth.signOut().catch(() => {})
        }
        console.error('Session check error:', error)
        setChecking(false)
        return
      }
      if (session) {
        router.replace('/chat')
      } else {
        setChecking(false)
      }
    }).catch((err) => {
      console.error('Unhandled session error:', err)
      setChecking(false)
    })
  }, [router])

  useEffect(() => {
    if (checking) return

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target as HTMLElement
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all stat items and data cards
    const elementsToObserve = document.querySelectorAll('.stat-item, .data-card, .app-card, .bar-item');
    elementsToObserve.forEach(el => {
        const htmlEl = el as HTMLElement
        htmlEl.style.opacity = '0';
        htmlEl.style.transform = 'translateY(30px)';
        htmlEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(htmlEl);
    });

    // Parallax effect on hero
    const handleScroll = () => {
        const scrolled = window.pageYOffset;
        if (heroPatternRef.current) {
            heroPatternRef.current.style.transform = `translate(-50%, -50%) rotate(${scrolled * 0.02}deg)`;
        }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
    }
  }, [checking])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0B0D]">
        <div className="w-8 h-8 border-4 border-[#C9A962] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    const target = document.getElementById(id);
    if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`landing-body ${cormorant.variable} ${dmSans.variable}`}>
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="logo cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            ALMAZ<span>.</span>
        </div>
        <ul className="nav-links">
            <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')}>Haqqımızda</a></li>
            <li><a href="#data" onClick={(e) => handleNavClick(e, 'data')}>Məlumat</a></li>
            <li><a href="#benchmarks" onClick={(e) => handleNavClick(e, 'benchmarks')}>Nəticələr</a></li>
            <li><a href="#applications" onClick={(e) => handleNavClick(e, 'applications')}>Tətbiqlər</a></li>
        </ul>
        <div className="flex items-center gap-4">
            <a href="#auth-section" onClick={(e) => handleNavClick(e, 'auth-section')} className="nav-links px-2 text-xs text-silver hover:text-gold uppercase tracking-widest transition-colors font-medium">Daxil ol / Log in</a>
            <a href="#auth-section" onClick={(e) => handleNavClick(e, 'auth-section')} className="nav-links px-2 text-xs text-silver hover:text-gold uppercase tracking-widest transition-colors font-medium">Qeydiyyat / Sign up</a>
            <button className="nav-cta" onClick={(e) => handleNavClick(e, 'auth-section')}>Başla</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-pattern" ref={heroPatternRef}></div>
        <div className="hero-content">
            <div className="hero-badge">
                <span>İndi İstifadəyə Verildi</span>
            </div>
            <h1>
                Azərbaycanın <span className="accent">Brilliant</span><br/>Süni İntellekti
                <span className="azerbaijani">الماز · алмаз · almaz</span>
            </h1>
            <p className="hero-subtitle">
                Yalnız Azərbaycan dilində anlama və nəsil üçün yaradılmış ilk peşəkar səviyyəli dil modeli.
            </p>
            <div className="hero-cta-group">
                <a href="#auth-section" onClick={(e) => handleNavClick(e, 'auth-section')} className="btn-primary">İndi Sına</a>
                <button className="btn-secondary" onClick={(e) => handleNavClick(e, 'about')}>Daha Ətraflı</button>
            </div>
        </div>
        <div className="scroll-indicator">
            <span>Aşağı çəkin</span>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-grid">
            <div className="stat-item">
                <div className="stat-number">38,139</div>
                <div className="stat-label">Benchmark sualları</div>
            </div>
            <div className="stat-item">
                <div className="stat-number">4.6×</div>
                <div className="stat-label">Səmərəlilik artımı</div>
            </div>
            <div className="stat-item">
                <div className="stat-number">11</div>
                <div className="stat-label">Bilik sahəsi</div>
            </div>
            <div className="stat-item">
                <div className="stat-number">110%</div>
                <div className="stat-label">Hədəf keçildi</div>
            </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="about-grid">
            <div className="about-visual">
                <div className="about-orbit">
                    <div className="orbit-dot"></div>
                </div>
                <div className="about-diamond"></div>
            </div>
            <div className="about-content">
                <h2>Azərbaycan dilində <span>düşünən</span> süni intellekt</h2>
                <p>
                    Uzun müddətdir ki, 10 milyondan çox insanın danışdığı Azərbaycan dili süni intellekt tərəfindən kifayət qədər diqqət görmürdü. Qlobal modellər ona sonradan əlavə edilmiş bir dil kimi yanaşır, sözləri parçalayır və Şərqlə Qərbin kəsişməsində yerləşən bu xalqın zəngin linqvistik irsini tam dərk etmir.
                </p>
                <p>
                    ALMAZ bunu dəyişir. Azərbaycan dilinin unikal simvollarını, aqqlütinativ morfologiyasını və mədəni kontekstini anlamaq üçün süni intellektin mətn emal metodunu kökündən yenidən işlədik.
                </p>
                <div className="about-features">
                    <div className="feature-item">
                        <div className="feature-icon">ə</div>
                        <div className="feature-text">
                            <h4>Yerli simvol dəstəyi</h4>
                            <p>ə simvolu və Azərbaycan dilinə məxsus hərflərin yüksək səviyyədə tanınması</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">◆</div>
                        <div className="feature-text">
                            <h4>Morfoloji ustalıq</h4>
                            <p>Mürəkkəb şəkilçilər mənalı vahidlər kimi başa düşülür</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">⚡</div>
                        <div className="feature-text">
                            <h4>4.6× Daha səmərəli</h4>
                            <p>İnqilabi tokenizator xərcləri kəskin şəkildə azaldır</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">◈</div>
                        <div className="feature-text">
                            <h4>Sahə ekspertizası</h4>
                            <p>Hüquqi, elmi və mədəni biliklər daxil edilmişdir</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Data Section */}
      <section className="data-section" id="data">
        <div className="section-header">
            <span className="section-label">Təlim bünövrəsi</span>
            <h2>Ən yaxşı Azərbaycan mətnləri üzərində qurulub</h2>
            <p>ALMAZ-ın zəkası süni intellekt təlimi üçün indiyə qədər toplanmış ən əhatəli Azərbaycan dili məlumat toplusuna əsaslanır.</p>
        </div>
        <div className="data-cards">
            <div className="data-card">
                <div className="data-card-icon">📚</div>
                <h3>Əsas LLM korpusu</h3>
                <div className="data-stat">651M+ söz</div>
                <p>Wikipedia, xəbərlər, bloqlar, kitablar və hüquqi sənədlərdən ibarət seçilmiş korpus.</p>
            </div>
            <div className="data-card">
                <div className="data-card-icon">🌐</div>
                <h3>Veb miqyaslı kolleksiya</h3>
                <div className="data-stat">94M söz</div>
                <p>Təmizlənmiş və təkrarlardan azad edilmiş müxtəlif veb məzmunu.</p>
            </div>
            <div className="data-card">
                <div className="data-card-icon">📰</div>
                <h3>Sənəd arxivi</h3>
                <div className="data-stat">1.9M sənəd</div>
                <p>Onillikləri əhatə edən xəbərlər, akademik jurnallar, kitablar və jurnallar.</p>
            </div>
            <div className="data-card">
                <div className="data-card-icon">📖</div>
                <h3>Ədəbi irs</h3>
                <div className="data-stat">3,600+ kitab</div>
                <p>Ümumilikdə 180 milyon sözdən ibarət klassik və müasir Azərbaycan ədəbiyyatı.</p>
            </div>
            <div className="data-card">
                <div className="data-card-icon">⚖️</div>
                <h3>Hüquqi və Qanunvericilik</h3>
                <div className="data-stat">Tam əhatə</div>
                <p>Qanunlar, qaydalar və konstitusiya sənədlərinin tam dəstəyi.</p>
            </div>
            <div className="data-card">
                <div className="data-card-icon">🎯</div>
                <h3>İxtisaslaşmış məlumatlar</h3>
                <div className="data-stat">Ekspert tərəfindən seçilib</div>
                <p>NER, təsnifat, sual-cavab üçün nəzərdə tutulmuş xüsusi məlumat setləri.</p>
            </div>
        </div>
      </section>

      {/* Benchmark Section */}
      <section className="benchmark" id="benchmarks">
        <div className="benchmark-content">
            <div className="benchmark-text">
                <h2><span>Gold-Standard</span> Benchmarklar tərəfindən təsdiqlənib</h2>
                <p>
                    ALMAZ, 11 akademik fənn üzrə 38,139 yerli sualı özündə birləşdirən TUMLU benchmarkı ilə yoxlanılıb. Tərcümə yoxdur, süni məlumat yoxdur. Ekspertlər tərəfindən təsdiqlənmiş real Azərbaycan məzmunu.
                </p>
                <ul className="benchmark-list">
                    <li>
                        <span className="benchmark-name">Riyaziyyat və Məntiq</span>
                        <span className="benchmark-value">+12%</span>
                    </li>
                    <li>
                        <span className="benchmark-name">Elm və Texnologiya</span>
                        <span className="benchmark-value">+14%</span>
                    </li>
                    <li>
                        <span className="benchmark-name">Tarix və Mədəniyyət</span>
                        <span className="benchmark-value">+11%</span>
                    </li>
                    <li>
                        <span className="benchmark-name">Hüquq və Hökumət</span>
                        <span className="benchmark-value">+15%</span>
                    </li>
                    <li>
                        <span className="benchmark-name">Dil və Ədəbiyyat</span>
                        <span className="benchmark-value">+13%</span>
                    </li>
                </ul>
            </div>
            <div className="benchmark-visual">
                <div className="benchmark-bars">
                    <div className="bar-item">
                        <div className="bar-label">
                            <span>Tokenization Fertility</span>
                            <span>≤2.2 hədəfə çatıldı</span>
                        </div>
                        <div className="bar-track">
                            <div className="bar-fill" style={{ width: '95%' }}></div>
                        </div>
                    </div>
                    <div className="bar-item">
                        <div className="bar-label">
                            <span>TUMLU Composite Score</span>
                            <span>+10% baseline ilə müqayisədə</span>
                        </div>
                        <div className="bar-track">
                            <div className="bar-fill" style={{ width: '88%' }}></div>
                        </div>
                    </div>
                    <div className="bar-item">
                        <div className="bar-label">
                            <span>Instruction Following</span>
                            <span>≥85% uyğunluq</span>
                        </div>
                        <div className="bar-track">
                            <div className="bar-fill" style={{ width: '92%' }}></div>
                        </div>
                    </div>
                    <div className="bar-item">
                        <div className="bar-label">
                            <span>NLU Task Performance</span>
                            <span>+8% kompozit</span>
                        </div>
                        <div className="bar-track">
                            <div className="bar-fill" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="applications" id="applications">
        <div className="section-header">
            <span className="section-label">İstifadə sahələri</span>
            <h2>Real dünya təsiri üçün yaradılıb</h2>
            <p>Dövlət xidmətlərindən müəssisə avtomatlaşdırılmasına qədər ALMAZ Azərbaycanın rəqəmsal təcrübələrini gücləndirir.</p>
        </div>
        <div className="apps-grid">
            <div className="app-card">
                <div className="app-icon">🏛️</div>
                <h3>Dövlət və İctimai Sektor</h3>
                <p>Vətəndaş xidmətlərinin avtomatlaşdırılması, sənəd emalı və siyasət tədqiqatları.</p>
            </div>
            <div className="app-card">
                <div className="app-icon">🏢</div>
                <h3>Müəssisə</h3>
                <p>Müştəri dəstəyinin avtomatlaşdırılması, biliklərin idarə edilməsi və biznes zəkası sistemləri.</p>
            </div>
            <div className="app-card">
                <div className="app-icon">🎓</div>
                <h3>Təhsil</h3>
                <p>İntellektual repetitorluq, avtomatlaşdırılmış qiymətləndirmə və təhsil məzmununun yaradılması.</p>
            </div>
            <div className="app-card">
                <div className="app-icon">📰</div>
                <h3>Media və Məzmun</h3>
                <p>Geniş miqyasda məzmun yaradılması, tərcümə keyfiyyətinin yoxlanılması və avtomatlaşdırılmış jurnalistika.</p>
            </div>
            <div className="app-card">
                <div className="app-icon">⚖️</div>
                <h3>Hüquq və Uyğunluq</h3>
                <p>Müqavilə analizi, tənzimləyici sənədlərin emalı və hüquqi araşdırmaların avtomatlaşdırılması.</p>
            </div>
            <div className="app-card">
                <div className="app-icon">🏥</div>
                <h3>Səhiyyə</h3>
                <p>Tibbi sənədləşmə, xəstə ünsiyyəti və klinik qərarların dəstəklənməsi.</p>
            </div>
        </div>
      </section>

      {/* Auth Section */}
      <section className="auth-section" id="auth-section">
        <div className="auth-container">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-pearl mb-4 font-display">ALMAZ-a qoşulun</h2>
                <p className="text-silver">Süni intellektin gücünü Azərbaycan dilində kəşf edin.</p>
            </div>
            <AuthButton />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-bg"></div>
        <div className="cta-content">
            <h2><span>ALMAZ</span> ilə qurmağa hazırsınız?</h2>
            <p>Məhsullarına və xidmətlərinə Azərbaycan dilində süni intellekt gətirən təşkilatlara qoşulun.</p>
            <div className="hero-cta-group">
                <button className="btn-primary" onClick={(e) => handleNavClick(e, 'auth-section')}>Giriş əldə edin</button>
                <button className="btn-secondary">Əlaqə saxlayın</button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
            <div>
                <div className="footer-logo">ALMAZ</div>
                <div className="footer-tagline">Azərbaycan dilində danışan AI. Yerli olaraq.</div>
            </div>
            <div className="footer-links">
                <a href="#">Sənədlər</a>
                <a href="#">API İstinad</a>
                <a href="#">Tədqiqat</a>
                <a href="#">Əlaqə</a>
            </div>
        </div>
      </footer>
    </div>
  )
}
