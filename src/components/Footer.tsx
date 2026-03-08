export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="font-bold text-spl-green text-lg">Elimeno</p>
                    <p className="text-sm text-spl-gray-dark">
                        Created by <span className="font-medium text-spl-blue">Ishan Chanuka</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        &copy; {new Date().getFullYear()} Elimeno. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
