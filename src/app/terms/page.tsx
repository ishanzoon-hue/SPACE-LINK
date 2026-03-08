import Link from 'next/link'

export default function TermsPage() {
  const conditions = [
    {
      title: "අසභ්‍ය හා අශෝභන අන්තර්ගතයන්",
      description: "Elimeno තුළ කිසිදු අසභ්‍ය ඡායාරූප, වීඩියෝ හෝ ලිඛිත පණිවිඩ හුවමාරු කිරීම සපුරා තහනම් වේ. එවැනි දේ කරන ගිණුම් අනතුරු ඇඟවීමකින් තොරව ඉවත් කරනු ලැබේ."
    },
    {
      title: "හිරිහැර කිරීම සහ අපහාස කිරීම",
      description: "අනෙකුත් පරිශීලකයන්ට තර්ජනය කිරීම, අපහාස කිරීම හෝ ඕනෑම ආකාරයක හිරිහැරයක් කිරීම තහනම්ය. අප සැමවිටම එකිනෙකාට ගෞරව කළ යුතුය."
    },
    {
      title: "වංචා සහ ස්පෑම් (Spam)",
      description: "වංචනික ලෙස මුදල් සෙවීමට උත්සාහ කිරීම, ව්‍යාජ තොරතුරු පතුරුවා හැරීම හෝ අනවශ්‍ය දැන්වීම් (Spam) මගින් පරිශීලකයන්ට කරදර කිරීම තහනම්ය."
    },
    {
      title: "පෞද්ගලිකත්වය (Privacy)",
      description: "අන් අයගේ අවසරයකින් තොරව ඔවුන්ගේ දුරකථන අංක, ලිපින හෝ පුද්ගලික තොරතුරු ප්‍රසිද්ධ කිරීමෙන් වැළකී සිටිය යුතුය."
    },
    {
      title: "ගිණුමේ වගකීම",
      description: "ඔබේ ගිණුම හරහා සිදුවන සියලුම ක්‍රියාකාරකම් සඳහා ඔබ වගකිව යුතුය. සැකකටයුතු දෙයක් දුටුවහොත් වහාම අප දැනුවත් කරන්න."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="bg-spl-green p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Elimeno</h1>
          <p className="text-green-50 text-sm uppercase tracking-widest">භාවිත කිරීමේ කොන්දේසි</p>
        </div>

        <div className="p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Elimeno ජාලය සැමවිටම ආරක්ෂිත සහ මිත්‍රශීලී පරිසරයක් ලෙස පවත්වාගෙන යාම අපගේ අරමුණයි.
            මෙම පද්ධතිය භාවිතා කරන ඔබ පහත සඳහන් කොන්දේසි වලට යටත් විය යුතුය.
          </p>

          <div className="space-y-8">
            {conditions.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-spl-green/10 text-spl-green flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link href="/" className="text-spl-blue font-semibold hover:underline">
              නැවත මුල් පිටුවට
            </Link>
            <p className="text-gray-400 text-xs mt-4">අවසන් වරට යාවත්කාලීන කළේ: 2026 මාර්තු 07</p>
          </div>
        </div>
      </div>
    </div>
  )
}