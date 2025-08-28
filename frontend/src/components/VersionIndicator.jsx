import React from 'react';
import { APP_VERSION } from '../config/version';

const VersionIndicator = ({ className = '' }) => {
    return (
        <div className={`text-xs text-text-secondary ${className}`}>
            v{APP_VERSION}
        </div>
    );
};

export default VersionIndicator;