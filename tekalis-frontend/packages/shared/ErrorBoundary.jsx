import React from 'react';
// Pas de Link ici — ErrorBoundary peut s'afficher sans Router
import PropTypes from 'prop-types';

/**
 * ErrorBoundary - Attrape les erreurs React pour éviter les crashes complets
 * Affiche une UI de secours élégante
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état pour afficher l'UI de secours
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Logger l'erreur
    console.error('🔴 Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      errorInfo
    });
    
    // TODO: Envoyer à un service de logging (Sentry, LogRocket, etc.)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { 
    //     extra: errorInfo 
    //   });
    // }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
          <div className="max-w-lg w-full">
            {/* Icône d'erreur */}
            <div className="text-center mb-8">
              <div className="inline-block p-6 bg-red-100 rounded-full mb-4">
                <svg 
                  className="w-16 h-16 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Oups ! Une erreur s'est produite
              </h1>
              
              <p className="text-gray-600 text-lg mb-6">
                Nous sommes désolés pour la gêne occasionnée. Notre équipe a été notifiée et travaille sur le problème.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 mb-8">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recharger la page
              </button>
              
              <a
                href="/"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg transition text-center"
              >
                Retour à l'accueil
              </a>

              <button
                onClick={this.handleReset}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition border-2 border-gray-300"
              >
                Réessayer
              </button>
            </div>

            {/* Détails de l'erreur (dev only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Détails de l'erreur (dev only)
                </summary>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Message :</p>
                    <pre className="p-3 bg-red-50 text-red-900 text-xs rounded border border-red-200 overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  
                  {this.state.errorInfo && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Stack trace :</p>
                      <pre className="p-3 bg-gray-50 text-gray-800 text-xs rounded border border-gray-200 overflow-auto max-h-60">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Besoin d'aide ?{' '}
                <a 
                  href="mailto:support@tekalis.com" 
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Contactez le support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;

/**
 * UTILISATION :
 * 
 * // Dans App.jsx
 * import ErrorBoundary from './components/shared/ErrorBoundary';
 * 
 * function App() {
 *   return (
 *     <ErrorBoundary>
 *       <YourApp />
 *     </ErrorBoundary>
 *   );
 * }
 * 
 * // Vous pouvez aussi wrapper des sections spécifiques
 * <ErrorBoundary>
 *   <ProductList />
 * </ErrorBoundary>
 */