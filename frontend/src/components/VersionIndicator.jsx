import React from 'react';
import { APP_VERSION } from '../config/version';

const VersionIndicator = ({ className = '' }) => {
    return (
        <div className={`bg-component-bg/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-border-color/50 text-xs text-text-secondary ${className}`}>
            v{APP_VERSION}
        </div>
    );
};

export default VersionIndicator;
